import Notification from './notification.model';
import User from '../users/user.model';
import { logger } from '../../server';
import { fcm } from '../../config/firebase';

export const sendPushNotification = async (
  userId: string,
  payload: { title: string; body: string; data?: any; type: string }
) => {
  try {
    // Only select fcmToken — avoid fetching entire user document
    const user = await User.findById(userId).select('fcmToken').lean();
    if (!user || !user.fcmToken) {
      logger.info(`Notification skipped: User ${userId} has no FCM token`);
      return;
    }

    // Parallel: save notification record + send FCM concurrently
    await Promise.all([
      Notification.create({
        user:  userId,
        type:  payload.type,
        title: payload.title,
        body:  payload.body,
        data:  payload.data,
      }),
      fcm.send({
        notification: { title: payload.title, body: payload.body },
        data: { ...payload.data, type: payload.type },
        token: user.fcmToken,
      }),
    ]);

    logger.info(`Notification sent to user ${userId}`);
  } catch (error) {
    // Non-fatal — notification failure should not crash the request
    logger.error('Push notification error:', error);
  }
};

/**
 * Fetch paginated notifications for a user (lean, compound index hit).
 */
export const getUserNotifications = async (
  userId: string,
  page = 1,
  limit = 20,
) => {
  const skip = (page - 1) * Math.min(limit, 50);
  const cap  = Math.min(limit, 50);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .select('type title body isRead createdAt data')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(cap)
      .lean(),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page, limit: cap };
};

/**
 * Mark all unread notifications as read (single update, indexed).
 */
export const markAllRead = async (userId: string) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } },
  );
};
