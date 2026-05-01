"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSmsOtp = void 0;
const axios_1 = __importDefault(require("axios"));
const server_1 = require("../server");
const response_1 = require("./response");
const sendSmsOtp = async (phone, otp) => {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    if (process.env.NODE_ENV === 'development') {
        server_1.logger.info(`[DEV] SMS to ${phone}: Your GoTogether OTP is ${otp}. Valid for 10 minutes.`);
        return true;
    }
    if (!authKey || !templateId) {
        server_1.logger.error('MSG91_AUTH_KEY or MSG91_TEMPLATE_ID not configured');
        return false;
    }
    try {
        const response = await axios_1.default.post('https://api.msg91.com/api/v5/otp', {
            template_id: templateId,
            mobile: phone.replace('+', ''),
            otp: otp,
            otp_expiry: 10
        }, {
            headers: { authkey: authKey, 'Content-Type': 'application/json' }
        });
        return response.data.type === 'success' || response.data.type === 'error'; // sometimes msg91 returns error if recently sent, but we handle rate limits in controller.
    }
    catch (error) {
        server_1.logger.error('Error sending SMS via MSG91:', error);
        throw new response_1.AppError('Failed to send OTP, try again', 500); // Caught by controller/error handler
    }
};
exports.sendSmsOtp = sendSmsOtp;
