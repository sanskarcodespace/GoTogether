import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { logger } from '../server';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`Error 💥: ${err.message}`, { stack: err.stack });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      stack: err.stack,
    });
  }

  // Production error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
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
