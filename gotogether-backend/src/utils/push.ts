import { fcm } from '../config/firebase';
import { logger } from '../server';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  token: string;
}

export const sendPushNotification = async (payload: PushPayload) => {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      token: payload.token,
    };

    const response = await fcm.send(message);
    logger.info(`Successfully sent push notification: ${response}`);
    return true;
  } catch (error) {
    logger.error('Error sending push notification:', error);
    return false;
  }
};
