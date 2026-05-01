"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const response_1 = require("../../utils/response");
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
exports.createOrder = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { amountInPaise, rideId } = req.body;
    if (!amountInPaise || !rideId) {
        return next(new response_1.AppError('Amount and rideId are required', 400));
    }
    const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: rideId,
    };
    const order = await razorpay.orders.create(options);
    return (0, response_1.formatResponse)(res, 200, 'Order created successfully', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
    });
});
exports.verifyPayment = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId } = req.body;
    const generated_signature = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');
    if (generated_signature !== razorpay_signature) {
        return next(new response_1.AppError('Payment verification failed', 400));
    }
    // TODO: Update ride payment status in database using rideId
    return (0, response_1.formatResponse)(res, 200, 'Payment verified successfully');
});
