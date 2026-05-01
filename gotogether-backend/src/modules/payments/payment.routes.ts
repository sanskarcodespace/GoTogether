import { Router } from 'express';
import * as paymentController from './payment.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.post('/create-order', protect, paymentController.createOrder);
router.post('/verify', protect, paymentController.verifyPayment);

export default router;
