import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import User from '../users/user.model';
import redisClient from '../../config/redis';
import { logger } from '../../server';

const generateTokens = (id: string, role: string, phone: string) => {
  const accessToken = jwt.sign({ id, role, phone }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

export const sendOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;
  
  // 1. Rate Limiting Check
  const attemptsKey = `otp_attempts:${phone}`;
  const attempts = await redisClient.get(attemptsKey);
  if (attempts && parseInt(attempts) >= 3) {
    return next(new AppError('Too many attempts. Please try again after 10 minutes.', 429));
  }

  // 2. Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  
  // 3. Store in Redis
  await redisClient.setEx(`otp:${phone}`, 600, otp);
  
  // 4. Increment attempts
  if (!attempts) {
    await redisClient.setEx(attemptsKey, 600, '1');
  } else {
    await redisClient.incr(attemptsKey);
  }

  // 5. In development, log to console
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[DEV] OTP for ${phone}: ${otp}`);
  } else {
    // TODO: Integration with SMS Provider (Twilio/MSG91)
    logger.info(`SMS sent to ${phone}`);
  }

  return formatResponse(res, 200, 'OTP sent successfully', { expiresIn: 600 });
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { phone, otp } = req.body;
  
  const storedOtp = await redisClient.get(`otp:${phone}`);
  if (!storedOtp) {
    return next(new AppError('OTP expired or not requested', 400));
  }

  // Constant-time comparison
  const isMatch = crypto.timingSafeEqual(Buffer.from(storedOtp), Buffer.from(otp));
  if (!isMatch) {
    return next(new AppError('Invalid OTP', 400));
  }

  // Cleanup
  await redisClient.del(`otp:${phone}`);
  await redisClient.del(`otp_attempts:${phone}`);

  let user = await User.findOne({ phone });
  let isNewUser = false;

  if (!user) {
    user = await User.create({ phone, role: 'user' });
    isNewUser = true;
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.phone);
  
  // Update last active
  user.lastActive = new Date();
  user.refreshTokens.push(refreshToken);
  await user.save();

  return formatResponse(res, 200, 'Logged in successfully', {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      phone: user.phone,
      name: user.name,
      profilePhoto: user.profilePhoto,
      isProfileComplete: !!user.name,
    },
    isNewUser,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return next(new AppError('Refresh token required', 401));

  try {
    const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return next(new AppError('Invalid refresh token', 403));
    }

    const { accessToken } = generateTokens(user.id, user.role, user.phone);
    return formatResponse(res, 200, 'Token refreshed', { accessToken });
  } catch (err) {
    return next(new AppError('Invalid refresh token', 403));
  }
});
