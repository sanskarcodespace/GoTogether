import { Router } from 'express';
import * as userController from './user.controller';
import { protect } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/uploadMiddleware';

const router = Router();

router.use(protect);

router.get('/me', userController.getMe);
router.put('/profile', upload.single('profilePhoto'), userController.updateProfile);
router.put('/fcm-token', userController.updateFCMToken);
router.get('/:userId/public-profile', userController.getPublicProfile);

export default router;
