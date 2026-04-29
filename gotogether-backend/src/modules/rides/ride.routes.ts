import { Router } from 'express';
import * as rideController from './ride.controller';
import { createRideSchema, searchRideSchema } from './ride.validator';
import { validate } from '../../middleware/validateMiddleware';
import { protect, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post(
  '/create',
  restrictTo('provider'),
  validate(createRideSchema),
  rideController.createRide
);

router.get(
  '/search',
  validate(searchRideSchema),
  rideController.getAvailableRides
);

export default router;
