import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import User from '../users/user.model';
import redisClient from '../../config/redis';
import { logger } from '../../server';
import { sendSmsOtp } from '../../utils/sms';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateTokens = (id: string, role: string, phone: string) => {
  const accessToken = jwt.sign(
    { userId: id, role, phone },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { userId: id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
};

/**
 * Step 1: Send OTP
 */
export const sendOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;

  // 1. Check if phone is blocked
  const isBlocked = await redisClient.get(`otp_blocked:${phone}`);
  if (isBlocked) {
    return next(new AppError('Phone number is temporarily blocked. Please try again later.', 429));
  }

  // 2. Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // 3. Store in Redis (TTL 10min)
  await redisClient.setEx(`otp:${phone}`, 600, otp);

  // 4. Send SMS via MSG91
  const smsSent = await sendSmsOtp(phone, otp);
  if (!smsSent && process.env.NODE_ENV !== 'development') {
    return next(new AppError('Failed to send OTP. Please try again.', 500));
  }

  return formatResponse(res, 200, 'OTP sent successfully', { expiresIn: 600 });
});

/**
 * Step 2: Verify OTP
 */
export const verifyOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { phone, otp } = req.body;

  // 1. Brute force check
  const attemptsKey = `otp_attempts:${phone}`;
  const attempts = await redisClient.get(attemptsKey);
  if (attempts && parseInt(attempts) >= 3) {
    await redisClient.setEx(`otp_blocked:${phone}`, 900, 'true'); // 15 min block
    await redisClient.del(attemptsKey);
    return next(new AppError('Too many failed attempts. Phone blocked for 15 minutes.', 429));
  }

  // 2. Get stored OTP
  const storedOtp = await redisClient.get(`otp:${phone}`);
  if (!storedOtp) {
    return next(new AppError('OTP expired or not requested', 400));
  }

  // 3. Constant-time comparison using crypto.timingSafeEqual
  const isMatch = crypto.timingSafeEqual(Buffer.from(storedOtp), Buffer.from(otp));
  if (!isMatch) {
    // Increment attempts
    if (!attempts) {
      await redisClient.setEx(attemptsKey, 600, '1');
    } else {
      await redisClient.incr(attemptsKey);
    }
    return next(new AppError('Invalid OTP', 400));
  }

  // 4. Success logic
  await redisClient.del(`otp:${phone}`);
  await redisClient.del(attemptsKey);

  let user = await User.findOne({ phone });
  let isNewUser = false;

  if (!user) {
    user = await User.create({ phone, role: 'user', isVerified: true });
    isNewUser = true;
  } else {
    user.isVerified = true;
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.phone);

  // Store refresh token in user and Redis for global invalidation
  user.refreshTokens.push(refreshToken);
  user.lastActive = new Date();
  await user.save();

  // Optionally track in Redis for global invalidation support
  await redisClient.sAdd(`active_sessions:${user.id}`, refreshToken);
  await redisClient.expire(`active_sessions:${user.id}`, 7 * 24 * 60 * 60);

  const isProfileComplete = !!(user.name && user.name.length > 0);

  return formatResponse(res, 200, 'Logged in successfully', {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
    isProfileComplete,
    isNewUser,
  });
});

/**
 * Step 4: Token Refresh (with rotation and reuse detection)
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken: oldToken } = req.body;
  if (!oldToken) return next(new AppError('Refresh token required', 401));

  try {
    // JWT secret rotation for refresh tokens
    const secrets = (process.env.JWT_REFRESH_SECRET || '').split(',');
    let decoded: any = null;
    let lastError: any = null;

    for (const secret of secrets) {
      try {
        decoded = jwt.verify(oldToken, secret.trim());
        if (decoded) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!decoded) {
      throw lastError || new Error('Invalid refresh token');
    }

    const user = await User.findById(decoded.userId);


    if (!user) return next(new AppError('User not found', 404));

    // Token Reuse Detection
    if (!user.refreshTokens.includes(oldToken)) {
      // THEFT DETECTION: If token was previously valid but now missing, it's reused
      // Revoke ALL tokens for this user
      user.refreshTokens = [];
      await user.save();
      await redisClient.del(`active_sessions:${user.id}`);
      return next(new AppError('Refresh token reuse detected. All sessions revoked.', 403));
    }

    // Issue new tokens (Rotation)
    const { accessToken, refreshToken: newToken } = generateTokens(user.id, user.role, user.phone);

    // Replace old RT with new RT in Mongo
    user.refreshTokens = user.refreshTokens.filter((t) => t !== oldToken);
    user.refreshTokens.push(newToken);
    await user.save();

    // Update Redis
    await redisClient.sRem(`active_sessions:${user.id}`, oldToken);
    await redisClient.sAdd(`active_sessions:${user.id}`, newToken);

    return formatResponse(res, 200, 'Token refreshed', {
      accessToken,
      refreshToken: newToken,
    });
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token', 403));
  }
});

/**
 * Step 5: Logout
 */
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;
  const user = req.user;

  if (refreshToken && user) {
    // Remove from Mongo
    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
    await user.save();

    // Remove from Redis
    await redisClient.sRem(`active_sessions:${user.id}`, refreshToken);
  }

  return formatResponse(res, 200, 'Logged out successfully');
});

/**
 * Step 6: Admin Login
 */
export const adminLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || user.role !== 'admin' || !user.password) {
    return next(new AppError('Invalid email or password', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AppError('Invalid email or password', 401));

  const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.phone);

  user.refreshTokens.push(refreshToken);
  user.lastActive = new Date();
  await user.save();

  await redisClient.sAdd(`active_sessions:${user.id}`, refreshToken);
  await redisClient.expire(`active_sessions:${user.id}`, 7 * 24 * 60 * 60);

  return formatResponse(res, 200, 'Admin logged in successfully', {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

