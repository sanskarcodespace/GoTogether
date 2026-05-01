"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicProfile = exports.updateFCMToken = exports.updateProfile = exports.getMe = void 0;
const response_1 = require("../../utils/response");
const user_model_1 = __importDefault(require("./user.model"));
const cache_1 = require("../../utils/cache");
exports.getMe = (0, response_1.asyncHandler)(async (req, res) => {
    return (0, response_1.formatResponse)(res, 200, 'User profile fetched', { user: req.user });
});
exports.updateProfile = (0, response_1.asyncHandler)(async (req, res) => {
    const { name, gender, emergencyContactName, emergencyContactPhone, vehicleType, vehicleModel, vehicleColor, vehiclePlate, } = req.body;
    const updates = {
        name,
        gender,
        emergencyContact: { name: emergencyContactName, phone: emergencyContactPhone },
    };
    if (req.file) {
        updates.profilePhoto = req.file.path;
    }
    if (vehicleType) {
        updates.vehicle = {
            type: vehicleType,
            model: vehicleModel,
            color: vehicleColor,
            plateNumber: vehiclePlate,
        };
    }
    const [user] = await Promise.all([
        user_model_1.default.findByIdAndUpdate(req.user.id, updates, { new: true }),
        // Invalidate public profile cache on any profile update
        (0, cache_1.invalidateCache)(cache_1.CacheKey.userPublic(req.user.id)),
    ]);
    return (0, response_1.formatResponse)(res, 200, 'Profile updated', { user });
});
exports.updateFCMToken = (0, response_1.asyncHandler)(async (req, res) => {
    const { fcmToken } = req.body;
    await user_model_1.default.findByIdAndUpdate(req.user.id, { fcmToken });
    return (0, response_1.formatResponse)(res, 200, 'Token updated');
});
exports.getPublicProfile = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { userId } = req.params;
    const cacheKey = cache_1.CacheKey.userPublic(userId);
    const user = await (0, cache_1.withCache)(cacheKey, cache_1.TTL.USER_PUBLIC, async () => {
        const result = await user_model_1.default.findById(userId)
            .select('name profilePhoto rating stats vehicle.type vehicle.model vehicle.color')
            .lean();
        if (!result)
            return null;
        return result;
    });
    if (!user)
        return next(new response_1.AppError('User not found', 404));
    return (0, response_1.formatResponse)(res, 200, 'Public profile fetched', user);
});
