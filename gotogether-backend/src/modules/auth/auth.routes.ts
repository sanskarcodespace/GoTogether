import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

router.post(
  '/send-otp',
  validate(z.object({
    body: z.object({
      phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian mobile number')
    })
  })),
  authController.sendOTP
);

router.post(
  '/verify-otp',
  validate(z.object({
    body: z.object({
      phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian mobile number'),
      otp: z.string().length(6).regex(/^\d+$/, 'OTP must be 6 digits')
    })
  })),
  authController.verifyOTP
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

router.post(
  '/admin/login',
  validate(z.object({ body: z.object({ email: z.string().email(), password: z.string().min(6) }) })),
  authController.adminLogin
);

export default router;
