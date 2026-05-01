import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

router.post(
  '/send-otp',
  validate(z.object({ body: z.object({ phone: z.string().min(10) }) })),
  authController.sendOTP
);

router.post(
  '/verify-otp',
  validate(z.object({ body: z.object({ phone: z.string().min(10), otp: z.string().length(6) }) })),
  authController.verifyOTP
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

export default router;
