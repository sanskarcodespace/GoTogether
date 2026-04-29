import { Router } from 'express';
import { asyncHandler, formatResponse } from '../../utils/response';
import { protect } from '../../middleware/authMiddleware';
import Notification from './notification.model';

const router = Router();

router.use(protect);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query as any;
  const query: any = { user: req.user.id };
  if (unreadOnly === 'true') query.isRead = false;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

  return formatResponse(res, 200, 'Notifications fetched', notifications, { unreadCount });
}));

router.put('/read-all', asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
  return formatResponse(res, 200, 'All marked as read');
}));

router.put('/:notificationId/read', asyncHandler(async (req: Request, res: Response) => {
  await Notification.findOneAndUpdate({ _id: req.params.notificationId, user: req.user.id }, { isRead: true });
  return formatResponse(res, 200, 'Marked as read');
}));

import { Request, Response } from 'express';

export default router;
