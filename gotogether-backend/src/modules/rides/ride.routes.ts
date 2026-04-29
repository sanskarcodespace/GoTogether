import { Router } from 'express';
import * as rideController from './ride.controller';
import { createRideSchema, searchRideSchema } from './ride.validator';
import { validate } from '../../middleware/validateMiddleware';
import { protect, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/create', restrictTo('user'), validate(createRideSchema), rideController.createRide);
router.get('/search', validate(searchRideSchema), rideController.getAvailableRides);
router.get('/active', rideController.getActiveRide);
router.get('/history', rideController.getRideHistory);
router.get('/:rideId', rideController.getRideDetails);
router.put('/:rideId/start', rideController.startRide);
router.put('/:rideId/complete', rideController.completeRide);
router.put('/:rideId/cancel', rideController.cancelRide);

// Ride Requests
router.post('/:rideId/requests', rideController.requestRide);
router.put('/:rideId/requests/:requestId/accept', rideController.acceptRequest);
router.put('/:rideId/requests/:requestId/reject', rideController.rejectRequest);
router.post('/requests/:requestId/verify-otp', rideController.verifyPassengerOTP);

export default router;
