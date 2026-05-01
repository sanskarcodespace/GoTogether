import { Router } from 'express';
import * as rideController from './ride.controller';
import { createRideSchema, searchRideSchema, createRequestSchema } from './ride.validator';
import { validate } from '../../middleware/validateMiddleware';
import { protect, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/create', restrictTo('user'), validate(createRideSchema), rideController.createRide);
router.get('/search', validate(searchRideSchema), rideController.getAvailableRides);
router.get('/suggested-price', rideController.getSuggestedPrice);
router.get('/active', rideController.getActiveRide);
router.get('/history', rideController.getRideHistory);
router.post('/sos', rideController.sendSOS);

// Live Status (public)
router.get('/:rideId/live-status', rideController.getLiveStatus);
router.get('/:rideId', rideController.getRideDetails);
router.put('/:rideId/start', rideController.startRide);
router.put('/:rideId/complete', rideController.completeRide);
router.put('/:rideId/cancel', rideController.cancelRide);

// Ride Requests
router.post('/:rideId/requests', validate(createRequestSchema), rideController.requestRide);
router.put('/:rideId/requests/:requestId/accept', rideController.acceptRequest);
router.put('/:rideId/requests/:requestId/reject', rideController.rejectRequest);
router.post('/requests/:requestId/verify-otp', rideController.verifyPassengerOTP);

export default router;
