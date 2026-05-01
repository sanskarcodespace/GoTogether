"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = exports.logout = exports.refreshToken = exports.verifyOTP = exports.sendOTP = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const response_1 = require("../../utils/response");
const user_model_1 = __importDefault(require("../users/user.model"));
const redis_1 = __importDefault(require("../../config/redis"));
const sms_1 = require("../../utils/sms");
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const generateTokens = (id, role, phone) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId: id, role, phone }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: id }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};
/**
 * Step 1: Send OTP
 */
exports.sendOTP = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { phone } = req.body;
    // 1. Check if phone is blocked
    const isBlocked = await redis_1.default.get(`otp_blocked:${phone}`);
    if (isBlocked) {
        return next(new response_1.AppError('Phone number is temporarily blocked. Please try again later.', 429));
    }
    // 2. Generate 6-digit OTP
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    // 3. Store in Redis (TTL 10min)
    await redis_1.default.setEx(`otp:${phone}`, 600, otp);
    // 4. Send SMS via MSG91
    const smsSent = await (0, sms_1.sendSmsOtp)(phone, otp);
    if (!smsSent && process.env.NODE_ENV !== 'development') {
        return next(new response_1.AppError('Failed to send OTP. Please try again.', 500));
    }
    return (0, response_1.formatResponse)(res, 200, 'OTP sent successfully', { expiresIn: 600 });
});
/**
 * Step 2: Verify OTP
 */
exports.verifyOTP = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { phone, otp } = req.body;
    // 1. Brute force check
    const attemptsKey = `otp_attempts:${phone}`;
    const attempts = await redis_1.default.get(attemptsKey);
    if (attempts && parseInt(attempts) >= 3) {
        await redis_1.default.setEx(`otp_blocked:${phone}`, 900, 'true'); // 15 min block
        await redis_1.default.del(attemptsKey);
        return next(new response_1.AppError('Too many failed attempts. Phone blocked for 15 minutes.', 429));
    }
    // 2. Get stored OTP
    const storedOtp = await redis_1.default.get(`otp:${phone}`);
    if (!storedOtp) {
        return next(new response_1.AppError('OTP expired or not requested', 400));
    }
    // 3. Constant-time comparison using crypto.timingSafeEqual
    const isMatch = crypto_1.default.timingSafeEqual(Buffer.from(storedOtp), Buffer.from(otp));
    if (!isMatch) {
        // Increment attempts
        if (!attempts) {
            await redis_1.default.setEx(attemptsKey, 600, '1');
        }
        else {
            await redis_1.default.incr(attemptsKey);
        }
        return next(new response_1.AppError('Invalid OTP', 400));
    }
    // 4. Success logic
    await redis_1.default.del(`otp:${phone}`);
    await redis_1.default.del(attemptsKey);
    let user = await user_model_1.default.findOne({ phone });
    let isNewUser = false;
    if (!user) {
        user = await user_model_1.default.create({ phone, role: 'user', isVerified: true });
        isNewUser = true;
    }
    else {
        user.isVerified = true;
    }
    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.phone);
    // Store refresh token in user and Redis for global invalidation
    user.refreshTokens.push(refreshToken);
    user.lastActive = new Date();
    await user.save();
    // Optionally track in Redis for global invalidation support
    await redis_1.default.sAdd(`active_sessions:${user.id}`, refreshToken);
    await redis_1.default.expire(`active_sessions:${user.id}`, 7 * 24 * 60 * 60);
    const isProfileComplete = !!(user.name && user.name.length > 0);
    return (0, response_1.formatResponse)(res, 200, 'Logged in successfully', {
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
exports.refreshToken = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { refreshToken: oldToken } = req.body;
    if (!oldToken)
        return next(new response_1.AppError('Refresh token required', 401));
    try {
        // JWT secret rotation for refresh tokens
        const secrets = (process.env.JWT_REFRESH_SECRET || '').split(',');
        let decoded = null;
        let lastError = null;
        for (const secret of secrets) {
            try {
                decoded = jsonwebtoken_1.default.verify(oldToken, secret.trim());
                if (decoded)
                    break;
            }
            catch (err) {
                lastError = err;
            }
        }
        if (!decoded) {
            throw lastError || new Error('Invalid refresh token');
        }
        const user = await user_model_1.default.findById(decoded.userId);
        if (!user)
            return next(new response_1.AppError('User not found', 404));
        // Token Reuse Detection
        if (!user.refreshTokens.includes(oldToken)) {
            // THEFT DETECTION: If token was previously valid but now missing, it's reused
            // Revoke ALL tokens for this user
            user.refreshTokens = [];
            await user.save();
            await redis_1.default.del(`active_sessions:${user.id}`);
            return next(new response_1.AppError('Refresh token reuse detected. All sessions revoked.', 403));
        }
        // Issue new tokens (Rotation)
        const { accessToken, refreshToken: newToken } = generateTokens(user.id, user.role, user.phone);
        // Replace old RT with new RT in Mongo
        user.refreshTokens = user.refreshTokens.filter((t) => t !== oldToken);
        user.refreshTokens.push(newToken);
        await user.save();
        // Update Redis
        await redis_1.default.sRem(`active_sessions:${user.id}`, oldToken);
        await redis_1.default.sAdd(`active_sessions:${user.id}`, newToken);
        return (0, response_1.formatResponse)(res, 200, 'Token refreshed', {
            accessToken,
            refreshToken: newToken,
        });
    }
    catch (err) {
        return next(new response_1.AppError('Invalid or expired refresh token', 403));
    }
});
/**
 * Step 5: Logout
 */
exports.logout = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { refreshToken } = req.body;
    const user = req.user;
    if (refreshToken && user) {
        // Remove from Mongo
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        await user.save();
        // Remove from Redis
        await redis_1.default.sRem(`active_sessions:${user.id}`, refreshToken);
    }
    return (0, response_1.formatResponse)(res, 200, 'Logged out successfully');
});
/**
 * Step 6: Admin Login
 */
exports.adminLogin = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new response_1.AppError('Please provide email and password', 400));
    const user = await user_model_1.default.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin' || !user.password) {
        return next(new response_1.AppError('Invalid email or password', 401));
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        return next(new response_1.AppError('Invalid email or password', 401));
    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.phone);
    user.refreshTokens.push(refreshToken);
    user.lastActive = new Date();
    await user.save();
    await redis_1.default.sAdd(`active_sessions:${user.id}`, refreshToken);
    await redis_1.default.expire(`active_sessions:${user.id}`, 7 * 24 * 60 * 60);
    return (0, response_1.formatResponse)(res, 200, 'Admin logged in successfully', {
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
