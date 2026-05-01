import { Request, Response, NextFunction } from 'express';
import * as rideService from './ride.service';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import Ride from './ride.model';
import RideRequest from './rideRequest.model';
import { getDistance } from '../../utils/googleMaps';
import { getIO } from '../../utils/socket';
import redisClient from '../../config/redis';

export const getSuggestedPrice = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { startLat, startLng, endLat, endLng, type } = req.query;
  
  if (!startLat || !startLng || !endLat || !endLng || !type) {
    return next(new AppError('Missing parameters', 400));
  }

  const distanceMatrix = await getDistance([`${startLat},${startLng}`], [`${endLat},${endLng}`]);
  if (!distanceMatrix || distanceMatrix.status !== 'OK') {
    return next(new AppError('Could not calculate distance', 500));
  }

  const distanceKm = distanceMatrix.distance.value / 1000;
  
  // Basic pricing model:
  // Car: base ₹50 + ₹10/km
  // Bike: base ₹20 + ₹5/km
  let suggestedPrice = 0;
  if (type === 'car') {
    suggestedPrice = 50 + (distanceKm * 10);
  } else {
    suggestedPrice = 20 + (distanceKm * 5);
  }

  // Round to nearest 5
  suggestedPrice = Math.round(suggestedPrice / 5) * 5;

  return formatResponse(res, 200, 'Suggested price calculated', {
    suggestedPrice,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMinutes: Math.round(distanceMatrix.duration.value / 60)
  });
});

import { io } from '../../server';

export const createRide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user.vehicle?.plateNumber) {
    return next(new AppError('Please set up your vehicle details first', 403));
  }
  
  const activeRide = await Ride.findOne({ provider: req.user.id, status: { $in: ['active', 'in_progress'] } });
  if (activeRide) return next(new AppError('You already have an active ride', 409));

  // Check if locations are within India (approximate bounding box)
  const inIndia = (lat: number, lng: number) => lat >= 8 && lat <= 38 && lng >= 68 && lng <= 98;
  const { startLocation, endLocation } = req.body;
  if (
    !inIndia(startLocation.coordinates[0], startLocation.coordinates[1]) ||
    !inIndia(endLocation.coordinates[0], endLocation.coordinates[1])
  ) {
    return next(new AppError('Location outside service area', 400));
  }

  const ride = await rideService.createNewRide(req.user.id, req.body);

  // Broadcast to all seekers
  getIO().of('/rides').emit('new_ride_available', ride);

  return formatResponse(res, 201, 'Ride created successfully', ride);
});

export const getAvailableRides = asyncHandler(async (req: Request, res: Response) => {
  const rides = await rideService.searchRides(req.query);
  return formatResponse(res, 200, 'Rides fetched successfully', rides);
});

export const getActiveRide = asyncHandler(async (req: Request, res: Response) => {
  const ride = await Ride.findOne({
    $or: [{ provider: req.user.id }, { 'passengers.seeker': req.user.id }],
    status: { $in: ['active', 'in_progress'] },
  }).populate('provider', 'name profilePhoto rating').populate('passengers.seeker', 'name profilePhoto');
  
  return formatResponse(res, 200, 'Active ride fetched', ride);
});

export const getRideDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ride = await Ride.findById(req.params.rideId)
    .populate('provider', 'name profilePhoto rating vehicle stats')
    .populate('passengers.seeker', 'name profilePhoto rating');
  if (!ride) return next(new AppError('Ride not found', 404));
  return formatResponse(res, 200, 'Ride details fetched', ride);
});

import { db as firebaseDb } from '../../config/firebase';
import { sendPushNotification } from '../notifications/notification.service';
import { sendSMS } from '../../utils/sms';

export const getLiveStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ride = await Ride.findById(req.params.rideId).populate('provider', 'name');
  if (!ride) return next(new AppError('Ride not found', 404));

  const providerSnapshot = await firebaseDb.ref(`active_rides/${ride._id}/provider_location`).once('value');
  let providerLocation = null;
  if (providerSnapshot.exists()) {
    providerLocation = providerSnapshot.val();
  }

  return formatResponse(res, 200, 'Live status fetched', {
    status: ride.status,
    provider: { name: (ride.provider as any).name },
    providerLocation,
    // ETA could be calculated on client or we can fetch Distance Matrix here
  });
});

export const sendSOS = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { rideId, lat, lng } = req.body;
  
  // Create SOS event in DB (omitted complex schema, assume logged in a generic alerts collection or just logged)
  console.log(`[SOS ALERT] User ${req.user.id} activated SOS at [${lat}, ${lng}] for ride ${rideId}`);

  // Send FCM to all admin users (mock topic)
  await sendPushNotification('admin_alerts', '🚨 SOS ALERT', `User ${req.user.name} requires emergency assistance!`, { type: 'SOS_ALERT', rideId, lat: String(lat), lng: String(lng) });

  // Send SMS to user's emergency contact
  if (req.user.emergencyContact?.phone) {
    try {
      await sendSMS(req.user.emergencyContact.phone, `EMERGENCY SOS: ${req.user.name} has activated SOS on GoTogether at https://maps.google.com/?q=${lat},${lng}. Please check on them immediately.`);
    } catch (e) {
      console.log('Failed to send SOS SMS');
    }
  }

  return formatResponse(res, 200, 'SOS Sent — Help is coming');
});

export const startRide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.rideId, provider: req.user.id, status: 'active' },
    { status: 'in_progress', startedAt: new Date() },
    { new: true }
  );
  if (!ride) return next(new AppError('Ride cannot be started', 400));
  return formatResponse(res, 200, 'Ride started', ride);
});

export const completeRide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.rideId, provider: req.user.id, status: 'in_progress' },
    { status: 'completed', completedAt: new Date() },
    { new: true }
  );
  if (!ride) return next(new AppError('Ride cannot be completed', 400));
  return formatResponse(res, 200, 'Ride completed', ride);
});

export const cancelRide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.rideId, provider: req.user.id, status: { $in: ['active', 'in_progress'] } },
    { status: 'cancelled', cancelledAt: new Date(), cancelReason: req.body.reason },
    { new: true }
  );
  if (!ride) return next(new AppError('Ride cannot be cancelled', 400));
  return formatResponse(res, 200, 'Ride cancelled', ride);
});

// Requests Logic
export const requestRide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const rideId = req.params.rideId;
  const existingRequest = await RideRequest.findOne({ ride: rideId, seeker: req.user.id, status: { $in: ['pending', 'accepted'] } });
  if (existingRequest) return next(new AppError('Request already sent', 409));

  const seekerActiveRide = await Ride.findOne({ 'passengers.seeker': req.user.id, status: { $in: ['active', 'in_progress'] } });
  if (seekerActiveRide) return next(new AppError('You already have an active ride', 409));

  const ride = await Ride.findById(rideId).populate('provider', 'name');
  if (!ride || ride.status !== 'active') return next(new AppError('Ride not available', 404));

  if (ride.provider._id.toString() === req.user.id) {
    return next(new AppError('You cannot request your own ride', 400));
  }

  if (ride.seats.available <= 0) {
    return next(new AppError('Ride is full', 409));
  }

  const request = await RideRequest.create({
    ride: rideId,
    seeker: req.user.id,
    ...req.body,
    expiresAt: new Date(Date.now() + 30_000),
  });

  // Notify provider via socket (server-side relay)
  const providerSid = await redisClient.get(`socket:${(ride.provider as any)._id}`);
  if (providerSid) {
    getIO().of('/rides').to(providerSid).emit('ride:new_request', {
      rideId,
      requestId: String(request._id),
      seeker: {
        _id:          req.user.id,
        name:         req.user.name,
        profilePhoto: req.user.profilePhoto,
      },
      ...req.body,
    });
  }

  return formatResponse(res, 201, 'Request sent', request);
});

export const acceptRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { rideId, requestId } = req.params;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const request = await RideRequest.findOneAndUpdate(
    { _id: requestId, ride: rideId, status: 'pending' },
    { status: 'accepted', acceptedAt: new Date(), otp: { code: otp, verified: false } },
    { new: true },
  );

  if (!request) return next(new AppError('Request not found or not pending', 404));

  // Notify seeker via socket (server-side relay)
  const seekerSid = await redisClient.get(`socket:${request.seeker}`);
  if (seekerSid) {
    getIO().of('/rides').to(seekerSid).emit('ride:accepted', {
      rideId,
      requestId,
      seekerId: String(request.seeker),
      otp,
      providerLocation: null, // seeker will get live location via Firebase RTDB
    });
  }

  return formatResponse(res, 200, 'Request accepted', request);
});

export const rejectRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { rideId, requestId } = req.params;
  const { reason = 'Request declined by provider' } = req.body;

  const request = await RideRequest.findOneAndUpdate(
    { _id: requestId, ride: rideId, status: 'pending' },
    { status: 'rejected', rejectedAt: new Date() },
    { new: true },
  );

  if (!request) return next(new AppError('Request not found or not pending', 404));

  // Notify seeker via socket (server-side relay)
  const seekerSid = await redisClient.get(`socket:${request.seeker}`);
  if (seekerSid) {
    getIO().of('/rides').to(seekerSid).emit('ride:rejected', {
      rideId,
      requestId,
      reason,
    });
  }

  return formatResponse(res, 200, 'Request rejected');
});

export const verifyPassengerOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const { otp } = req.body;
  
  const request = await RideRequest.findOne({ _id: requestId });
  if (!request) return next(AppError.notFound('Ride request'));

  if (request.otp.verified) {
    return next(AppError.conflict('Passenger already verified'));
  }

  const ride = await Ride.findById(request.ride);
  if (!ride || ride.status === 'cancelled' || ride.status === 'completed') {
    return next(AppError.badRequest('Ride is no longer active'));
  }

  const attemptsKey = `passenger_otp_attempts:${requestId}`;
  const attempts = await redisClient.get(attemptsKey);
  if (attempts && parseInt(attempts) >= 3) {
    return next(AppError.tooManyRequests('Too many failed attempts. Please contact support.'));
  }

  if (request.otp.code !== otp) {
    await redisClient.incr(attemptsKey);
    await redisClient.expire(attemptsKey, 900); // 15 mins block
    return next(AppError.badRequest('Invalid OTP'));
  }

  await redisClient.del(attemptsKey);

  request.otp.verified = true;
  await request.save();

  // Add to ride passengers
  await Ride.findByIdAndUpdate(request.ride, {
    $push: {
      passengers: {
        seeker: request.seeker,
        request: request._id,
        status: 'accepted',
        pickupLocation: request.pickupLocation,
        dropLocation: request.dropLocation,
        fareAmount: request.estimatedFare,
      },
    },
    $inc: { 'seats.available': -1 },
  });

  return formatResponse(res, 200, 'OTP verified, passenger boarded');
});

export const getRideHistory = asyncHandler(async (req: Request, res: Response) => {
  const { role = 'seeker', page = 1, limit = 10 } = req.query as any;
  const query = role === 'provider' ? { provider: req.user.id } : { 'passengers.seeker': req.user.id };
  
  const rides = await Ride.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  const total = await Ride.countDocuments(query);

  return formatResponse(res, 200, 'History fetched', rides, { page, total, totalPages: Math.ceil(total / limit) });
});
