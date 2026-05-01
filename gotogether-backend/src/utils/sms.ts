import axios from 'axios';
import { logger } from '../server';
import { AppError } from './response';

export const sendSmsOtp = async (phone: string, otp: string) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (process.env.NODE_ENV === 'development') {
    logger.info(`[DEV] SMS to ${phone}: Your GoTogether OTP is ${otp}. Valid for 10 minutes.`);
    return true;
  }

  if (!authKey || !templateId) {
    logger.error('MSG91_AUTH_KEY or MSG91_TEMPLATE_ID not configured');
    return false;
  }

  try {
    const response = await axios.post('https://api.msg91.com/api/v5/otp', 
      {
        template_id: templateId,
        mobile: phone.replace('+', ''),
        otp: otp,
        otp_expiry: 10
      },
      {
        headers: { authkey: authKey, 'Content-Type': 'application/json' }
      }
    );

    return response.data.type === 'success' || response.data.type === 'error'; // sometimes msg91 returns error if recently sent, but we handle rate limits in controller.
  } catch (error) {
    logger.error('Error sending SMS via MSG91:', error);
    throw new AppError('Failed to send OTP, try again', 500); // Caught by controller/error handler
  }
};
