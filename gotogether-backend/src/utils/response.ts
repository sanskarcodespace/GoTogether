import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(resource: string) {
    return new AppError(`${resource} not found`, 404);
  }
  static unauthorized(msg = 'Unauthorized') {
    return new AppError(msg, 401);
  }
  static forbidden(msg = 'Forbidden') {
    return new AppError(msg, 403);
  }
  static badRequest(msg: string, errors?: any[]) {
    return new AppError(msg, 400, errors);
  }
  static conflict(msg: string) {
    return new AppError(msg, 409);
  }
  static tooManyRequests(msg = 'Too many requests') {
    return new AppError(msg, 429);
  }
  static internal(msg = 'Internal server error') {
    return new AppError(msg, 500);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const formatResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  meta?: any
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};
