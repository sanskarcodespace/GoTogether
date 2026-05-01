import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { amountInPaise, rideId } = req.body;

  if (!amountInPaise || !rideId) {
    return next(new AppError('Amount and rideId are required', 400));
  }

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: rideId,
  };

  const order = await razorpay.orders.create(options);

  return formatResponse(res, 200, 'Order created successfully', {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId } = req.body;

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    return next(new AppError('Payment verification failed', 400));
  }

  // TODO: Update ride payment status in database using rideId

  return formatResponse(res, 200, 'Payment verified successfully');
});
