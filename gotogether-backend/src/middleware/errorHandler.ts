import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { logger } from '../server';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = AppError.badRequest('Invalid ID format');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = AppError.conflict(`${field} already exists`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el: any) => ({
      field: el.path,
      message: el.message,
    }));
    error = new AppError('Validation Error', 422, errors);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = AppError.unauthorized('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = AppError.unauthorized('Token expired');
  }

  if (process.env.NODE_ENV === 'development') {
    logger.error(`Error 💥: ${error.message}`, { stack: err.stack });
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
      stack: err.stack,
    });
  }

  // Production error response
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  // Programming or other unknown errors: don't leak error details
  logger.error('ERROR 💥', err);
  return res.status(500).json({
    success: false,
    message: 'Something went very wrong!',
  });
};

export default errorHandler;
