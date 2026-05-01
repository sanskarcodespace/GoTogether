import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler, formatResponse } from '../../utils/response';
import { protect, restrictTo } from '../../middleware/authMiddleware';
import User from '../users/user.model';
import Ride from '../rides/ride.model';
import SosEvent from './sos.model';
import { withCache, invalidateCache, CacheKey, TTL } from '../../utils/cache';

const router = Router();

router.use(protect, restrictTo('admin'));

// ─── Dashboard Stats (cached 1 min, computed via Promise.all) ────────────────
router.get('/dashboard/stats', asyncHandler(async (_req: Request, res: Response) => {
  const stats = await withCache(CacheKey.adminStats(), TTL.ADMIN_STATS, async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Run all count queries in parallel — single aggregation for ride stats
    const [
      totalUsers,
      newUsersToday,
      activeRides,
      totalRidesToday,
      activeSosAlerts,
      rideStatsAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfDay } }),
      Ride.countDocuments({ status: 'active' }),
      Ride.countDocuments({ createdAt: { $gte: startOfDay } }),
      SosEvent.countDocuments({ status: 'active' }),
      // Single aggregation for completion rate + avg duration
      Ride.aggregate([
        {
          $facet: {
            completed: [{ $match: { status: 'completed' } }, { $count: 'n' }],
            finished:  [{ $match: { status: { $in: ['completed', 'cancelled'] } } }, { $count: 'n' }],
            avgDuration: [
              {
                $match: {
                  status:    'completed',
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

    const facet         = rideStatsAgg[0] ?? {};
    const completed     = facet.completed?.[0]?.n ?? 0;
    const finished      = facet.finished?.[0]?.n ?? 0;
    const avgMs         = facet.avgDuration?.[0]?.avg ?? 0;
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

  return formatResponse(res, 200, 'Admin stats fetched', stats);
}));

// ─── Users List (paginated, lean) ────────────────────────────────────────────
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const skip  = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ role: 'user' })
      .select('name phone profilePhoto isActive isBanned rating stats createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({ role: 'user' }),
  ]);

  return formatResponse(res, 200, 'Users fetched', users, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}));

// ─── Ban user (invalidates user cache) ───────────────────────────────────────
router.put('/users/:userId/ban', asyncHandler(async (req: Request, res: Response) => {
  await Promise.all([
    User.findByIdAndUpdate(req.params.userId, {
      isBanned: true,
      banReason: req.body.reason,
    }),
    invalidateCache(CacheKey.userPublic(req.params.userId)),
  ]);
  return formatResponse(res, 200, 'User banned');
}));

// ─── SOS Events (paginated, lean) ────────────────────────────────────────────
router.get('/sos-events', asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const skip  = (page - 1) * limit;

  const [events, total] = await Promise.all([
    SosEvent.find()
      .populate('user', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SosEvent.countDocuments(),
  ]);

  return formatResponse(res, 200, 'SOS events fetched', events, {
    page, limit, total,
    totalPages: Math.ceil(total / limit),
  });
}));

export default router;
