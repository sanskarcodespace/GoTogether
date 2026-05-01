import axios from 'axios';
import { logger } from '../server';

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
    // MSG91 API call
    // Note: phone should include country code without '+' for MSG91 usually, 
    // but the user says "Your GoTogether OTP is {otp}".
    // The request says template: "Your GoTogether OTP is {otp}. Valid for 10 minutes."
    
    const response = await axios.get('https://api.msg91.com/api/v5/otp', {
      params: {
        template_id: templateId,
        mobile: phone.replace('+', ''),
        authkey: authKey,
        otp: otp,
      },
    });

    return response.data.type === 'success';
  } catch (error) {
    logger.error('Error sending SMS via MSG91:', error);
    return false;
  }
};
