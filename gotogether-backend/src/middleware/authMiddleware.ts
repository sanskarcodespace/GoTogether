import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, asyncHandler } from '../utils/response';
import User from '../modules/users/user.model';

interface JWTPayload {
  userId: string;
  role: string;
  phone: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    // JWT secret rotation: support multiple valid secrets (comma-separated in env)
    const secrets = (process.env.JWT_ACCESS_SECRET || '').split(',');
    let decoded: JWTPayload | null = null;
    let lastError: any = null;

    for (const secret of secrets) {
      try {
        decoded = jwt.verify(token, secret.trim()) as JWTPayload;
        if (decoded) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!decoded) {
      throw lastError || new Error('Invalid token');
    }
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user is banned
    if (currentUser.isBanned) {
      return next(new AppError('Your account has been banned. Please contact support.', 403));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid token or token expired.', 401));
  }
});



export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
