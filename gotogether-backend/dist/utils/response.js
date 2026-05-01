"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResponse = exports.asyncHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    errors;
    constructor(message, statusCode, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
    static notFound(resource) {
        return new AppError(`${resource} not found`, 404);
    }
    static unauthorized(msg = 'Unauthorized') {
        return new AppError(msg, 401);
    }
    static forbidden(msg = 'Forbidden') {
        return new AppError(msg, 403);
    }
    static badRequest(msg, errors) {
        return new AppError(msg, 400, errors);
    }
    static conflict(msg) {
        return new AppError(msg, 409);
    }
    static tooManyRequests(msg = 'Too many requests') {
        return new AppError(msg, 429);
    }
    static internal(msg = 'Internal server error') {
        return new AppError(msg, 500);
    }
}
exports.AppError = AppError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const formatResponse = (res, statusCode, message, data, meta) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        meta,
    });
};
exports.formatResponse = formatResponse;
