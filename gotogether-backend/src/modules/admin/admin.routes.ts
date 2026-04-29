import { Router } from 'express';
import { asyncHandler, formatResponse } from '../../utils/response';
import { protect, restrictTo } from '../../middleware/authMiddleware';
import User from '../users/user.model';
import Ride from '../rides/ride.model';
import SosEvent from './sos.model';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard/stats', asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const activeRides = await Ride.countDocuments({ status: 'active' });
  const totalRides = await Ride.countDocuments();
  
  return formatResponse(res, 200, 'Admin stats fetched', {
    totalUsers,
    activeRides,
    totalRides,
    newUsersToday: 5, // mock
    completionRate: '92%', // mock
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
