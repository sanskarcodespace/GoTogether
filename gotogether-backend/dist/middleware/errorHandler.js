"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const server_1 = require("../server");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = response_1.AppError.badRequest('Invalid ID format');
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = response_1.AppError.conflict(`${field} already exists`);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el) => ({
            field: el.path,
            message: el.message,
        }));
        error = new response_1.AppError('Validation Error', 422, errors);
    }
    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error = response_1.AppError.unauthorized('Invalid token');
    }
    if (err.name === 'TokenExpiredError') {
        error = response_1.AppError.unauthorized('Token expired');
    }
    if (process.env.NODE_ENV === 'development') {
        server_1.logger.error(`Error 💥: ${error.message}`, { stack: err.stack });
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
    server_1.logger.error('ERROR 💥', err);
    return res.status(500).json({
        success: false,
        message: 'Something went very wrong!',
    });
};
exports.default = errorHandler;
