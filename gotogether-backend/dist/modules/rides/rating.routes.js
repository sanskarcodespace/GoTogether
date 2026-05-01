"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../utils/response");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const rating_model_1 = __importDefault(require("./rating.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const ride_model_1 = __importDefault(require("./ride.model"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/:rideId/rate', (0, response_1.asyncHandler)(async (req, res, next) => {
    const { ratedUserId, score, comment, tags } = req.body;
    const rideId = req.params.rideId;
    const existing = await rating_model_1.default.findOne({ ride: rideId, rater: req.user.id, rated: ratedUserId });
    if (existing)
        return next(response_1.AppError.conflict('Already rated'));
    if (req.user.id === ratedUserId) {
        return next(response_1.AppError.badRequest('You cannot rate yourself'));
    }
    const ride = await ride_model_1.default.findById(rideId);
    if (!ride)
        return next(response_1.AppError.notFound('Ride'));
    const userToRate = await user_model_1.default.findById(ratedUserId);
    if (!userToRate)
        return next(response_1.AppError.notFound('User'));
    // 24h window check
    if (ride.status !== 'completed' && ride.status !== 'cancelled') {
        return next(response_1.AppError.badRequest('Ride is not completed yet'));
    }
    const completionTime = ride.completedAt || ride.cancelledAt || ride.updatedAt;
    const hoursSinceCompletion = (Date.now() - new Date(completionTime).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCompletion > 24) {
        return next(response_1.AppError.badRequest('Rating window expired. You can only rate within 24 hours of ride completion.'));
    }
    const isProvider = ride.provider.toString() === ratedUserId;
    const roleType = isProvider ? 'asProvider' : 'asSeeker';
    const rating = await rating_model_1.default.create({
        ride: rideId,
        rater: req.user.id,
        rated: ratedUserId,
        score,
        comment,
        tags,
        raterRole: isProvider ? 'seeker' : 'provider',
    });
    const user = await user_model_1.default.findById(ratedUserId);
    if (user) {
        const oldAvg = user.rating?.[roleType]?.average || 0;
        const oldCount = user.rating?.[roleType]?.count || 0;
        const newAvg = (oldAvg * oldCount + score) / (oldCount + 1);
        await user_model_1.default.findByIdAndUpdate(ratedUserId, {
            [`rating.${roleType}.average`]: Math.round(newAvg * 10) / 10,
            [`rating.${roleType}.count`]: oldCount + 1,
        });
    }
    return (0, response_1.formatResponse)(res, 201, 'Rating submitted', rating);
}));
exports.default = router;
