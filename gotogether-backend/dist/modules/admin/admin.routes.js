"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../utils/response");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const user_model_1 = __importDefault(require("../users/user.model"));
const ride_model_1 = __importDefault(require("../rides/ride.model"));
const sos_model_1 = __importDefault(require("./sos.model"));
const cache_1 = require("../../utils/cache");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('admin'));
// ─── Dashboard Stats (cached 1 min, computed via Promise.all) ────────────────
router.get('/dashboard/stats', (0, response_1.asyncHandler)(async (_req, res) => {
    const stats = await (0, cache_1.withCache)(cache_1.CacheKey.adminStats(), cache_1.TTL.ADMIN_STATS, async () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        // Run all count queries in parallel — single aggregation for ride stats
        const [totalUsers, newUsersToday, activeRides, totalRidesToday, activeSosAlerts, rideStatsAgg,] = await Promise.all([
            user_model_1.default.countDocuments({ role: 'user' }),
            user_model_1.default.countDocuments({ role: 'user', createdAt: { $gte: startOfDay } }),
            ride_model_1.default.countDocuments({ status: 'active' }),
            ride_model_1.default.countDocuments({ createdAt: { $gte: startOfDay } }),
            sos_model_1.default.countDocuments({ status: 'active' }),
            // Single aggregation for completion rate + avg duration
            ride_model_1.default.aggregate([
                {
                    $facet: {
                        completed: [{ $match: { status: 'completed' } }, { $count: 'n' }],
                        finished: [{ $match: { status: { $in: ['completed', 'cancelled'] } } }, { $count: 'n' }],
                        avgDuration: [
                            {
                                $match: {
                                    status: 'completed',
                                    startedAt: { $exists: true },
                                    completedAt: { $exists: true },
                                },
                            },
                            {
                                $project: { duration: { $subtract: ['$completedAt', '$startedAt'] } },
                            },
                            { $group: { _id: null, avg: { $avg: '$duration' } } },
                        ],
                    },
                },
            ]),
        ]);
        const facet = rideStatsAgg[0] ?? {};
        const completed = facet.completed?.[0]?.n ?? 0;
        const finished = facet.finished?.[0]?.n ?? 0;
        const avgMs = facet.avgDuration?.[0]?.avg ?? 0;
        const completionRate = finished > 0
            ? `${Math.round((completed / finished) * 100)}%`
            : '0%';
        return {
            totalUsers,
            newUsersToday,
            activeRides,
            totalRidesToday,
            completionRate,
            averageRideDuration: `${Math.round(avgMs / 60_000)} mins`,
            activeSosAlerts,
        };
    });
    return (0, response_1.formatResponse)(res, 200, 'Admin stats fetched', stats);
}));
// ─── Users List (paginated, lean) ────────────────────────────────────────────
router.get('/users', (0, response_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        user_model_1.default.find({ role: 'user' })
            .select('name phone profilePhoto isActive isBanned rating stats createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        user_model_1.default.countDocuments({ role: 'user' }),
    ]);
    return (0, response_1.formatResponse)(res, 200, 'Users fetched', users, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}));
// ─── Ban user (invalidates user cache) ───────────────────────────────────────
router.put('/users/:userId/ban', (0, response_1.asyncHandler)(async (req, res) => {
    await Promise.all([
        user_model_1.default.findByIdAndUpdate(req.params.userId, {
            isBanned: true,
            banReason: req.body.reason,
        }),
        (0, cache_1.invalidateCache)(cache_1.CacheKey.userPublic(req.params.userId)),
    ]);
    return (0, response_1.formatResponse)(res, 200, 'User banned');
}));
// ─── SOS Events (paginated, lean) ────────────────────────────────────────────
router.get('/sos-events', (0, response_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
        sos_model_1.default.find()
            .populate('user', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        sos_model_1.default.countDocuments(),
    ]);
    return (0, response_1.formatResponse)(res, 200, 'SOS events fetched', events, {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
    });
}));
exports.default = router;
