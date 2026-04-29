import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import User from '../users/user.model';
import redisClient from '../../config/redis';

const generateTokens = (id: string, role: string, phone: string) => {
  const accessToken = jwt.sign({ id, role, phone }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
  return { accessToken, refreshToken };
};

export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;
  const otp = '123456'; // Default for testing as per common dev pattern
  
  await redisClient.setEx(`otp:${phone}`, 600, otp);
  
  return formatResponse(res, 200, 'OTP sent successfully', { expiresIn: 600 });
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { phone, otp } = req.body;
  
  const storedOtp = await redisClient.get(`otp:${phone}`);
  if (!storedOtp || storedOtp !== otp) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  let user = await User.findOne({ phone });
  let isNewUser = false;

  if (!user) {
    user = await User.create({ phone, role: 'user' });
    isNewUser = true;
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.phone);
  
  // Store refresh token in user doc
  user.refreshTokens.push(refreshToken);
  await user.save();

  await redisClient.del(`otp:${phone}`);

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
