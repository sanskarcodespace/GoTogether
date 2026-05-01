import { Router, Request, Response } from 'express';
import { asyncHandler, formatResponse } from '../../utils/response';
import { protect } from '../../middleware/authMiddleware';
import {
  getUserNotifications,
  markAllRead,
} from './notification.service';
import Notification from './notification.model';

const router = Router();
router.use(protect);

// ─── List notifications (paginated, lean, compound-index hit) ─────────────────
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const page       = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit      = Math.min(50, parseInt(req.query.limit as string) || 20);
  const unreadOnly = req.query.unreadOnly === 'true';

  if (unreadOnly) {
    // Cheaper path: only unread, uses compound index { user, isRead }
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user.id, isRead: false })
        .select('type title body isRead createdAt data')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ user: req.user.id, isRead: false }),
    ]);
    return formatResponse(res, 200, 'Notifications fetched', notifications, {
      page, limit, total: unreadCount, unreadCount,
    });
  }

  const result = await getUserNotifications(req.user.id, page, limit);
  return formatResponse(res, 200, 'Notifications fetched', result.notifications, {
    page:        result.page,
    limit:       result.limit,
    total:       result.total,
    unreadCount: result.unreadCount,
  });
}));

// ─── Mark all read (single indexed update) ────────────────────────────────────
router.put('/read-all', asyncHandler(async (req: Request, res: Response) => {
  await markAllRead(req.user.id);
  return formatResponse(res, 200, 'All marked as read');
}));

// ─── Mark single notification read ───────────────────────────────────────────
router.put('/:notificationId/read', asyncHandler(async (req: Request, res: Response) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, user: req.user.id },
    { $set: { isRead: true } },
  );
  return formatResponse(res, 200, 'Marked as read');
}));

export default router;
