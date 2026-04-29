import { fcm } from '../../config/firebase';
import User from '../users/user.model';
import Notification from './notification.model';
import { logger } from '../../server';

export const sendPushNotification = async (
  userId: string,
  payload: { title: string; body: string; data?: any; type: string }
) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      logger.info(`Notification skipped: User ${userId} has no FCM token`);
      return;
    }

    // Create record in DB
    await Notification.create({
      user: userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });

    // Send to FCM
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...payload.data,
        type: payload.type,
      },
      token: user.fcmToken,
    };

    await fcm.send(message);
    logger.info(`Notification sent to user ${userId}`);
  } catch (error) {
    logger.error('Push notification error:', error);
  }
};
