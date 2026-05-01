"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../utils/response");
const user_model_1 = __importDefault(require("../modules/users/user.model"));
exports.protect = (0, response_1.asyncHandler)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new response_1.AppError('You are not logged in! Please log in to get access.', 401));
    }
    try {
        // JWT secret rotation: support multiple valid secrets (comma-separated in env)
        const secrets = (process.env.JWT_ACCESS_SECRET || '').split(',');
        let decoded = null;
        let lastError = null;
        for (const secret of secrets) {
            try {
                decoded = jsonwebtoken_1.default.verify(token, secret.trim());
                if (decoded)
                    break;
            }
            catch (err) {
                lastError = err;
            }
        }
        if (!decoded) {
            throw lastError || new Error('Invalid token');
        }
        // Check if user still exists
        const currentUser = await user_model_1.default.findById(decoded.userId);
        if (!currentUser) {
            return next(new response_1.AppError('The user belonging to this token no longer exists.', 401));
        }
        // Check if user is banned
        if (currentUser.isBanned) {
            return next(new response_1.AppError('Your account has been banned. Please contact support.', 403));
        }
        // Grant access to protected route
        req.user = currentUser;
        next();
    }
    catch (error) {
        return next(new response_1.AppError('Invalid token or token expired.', 401));
    }
});
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new response_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
