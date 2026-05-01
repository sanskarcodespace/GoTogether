import { Router } from 'express';
import { asyncHandler, formatResponse } from '../../utils/response';
import { protect, restrictTo } from '../../middleware/authMiddleware';
import User from '../users/user.model';
import Ride from '../rides/ride.model';
import SosEvent from './sos.model';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard/stats', asyncHandler(async (req: Request, res: Response) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const totalUsers = await User.countDocuments({ role: 'user' });
  const newUsersToday = await User.countDocuments({ role: 'user', createdAt: { $gte: startOfDay } });
  
  const activeRides = await Ride.countDocuments({ status: 'active' });
  const totalRidesToday = await Ride.countDocuments({ createdAt: { $gte: startOfDay } });
  
  const completedRides = await Ride.countDocuments({ status: 'completed' });
  const totalFinishedRides = await Ride.countDocuments({ status: { $in: ['completed', 'cancelled'] } });
  const completionRate = totalFinishedRides > 0 ? Math.round((completedRides / totalFinishedRides) * 100) + '%' : '0%';
  
  // Aggregate average ride duration for completed rides
  const avgDurationResult = await Ride.aggregate([
    { $match: { status: 'completed', startTime: { $exists: true }, endTime: { $exists: true } } },
    { $project: { duration: { $subtract: ['$endTime', '$startTime'] } } },
    { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
  ]);
  const avgDurationMs = avgDurationResult[0]?.avgDuration || 0;
  const avgDurationMins = Math.round(avgDurationMs / 60000);

  const activeSosAlerts = await SosEvent.countDocuments({ status: 'active' });
  
  return formatResponse(res, 200, 'Admin stats fetched', {
    totalUsers,
    newUsersToday,
    activeRides,
    totalRidesToday,
    completionRate,
    averageRideDuration: `${avgDurationMins} mins`,
    activeSosAlerts,
  });
}));

router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  return formatResponse(res, 200, 'Users fetched', users);
}));

router.put('/users/:userId/ban', asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.params.userId, { isBanned: true, banReason: req.body.reason });
  return formatResponse(res, 200, 'User banned');
}));

router.get('/sos-events', asyncHandler(async (req: Request, res: Response) => {
  const events = await SosEvent.find().populate('user', 'name phone').sort({ createdAt: -1 });
  return formatResponse(res, 200, 'SOS events fetched', events);
}));

import { Request, Response } from 'express';

export default router;
