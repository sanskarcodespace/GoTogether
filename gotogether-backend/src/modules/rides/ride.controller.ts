import { Request, Response, NextFunction } from 'express';
import * as rideService from './ride.service';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import Ride from './ride.model';
import RideRequest from './rideRequest.model';

export const createRide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user.vehicle?.plateNumber) {
    return next(new AppError('Please set up your vehicle details first', 403));
  }
  
  const activeRide = await Ride.findOne({ provider: req.user.id, status: { $in: ['active', 'in_progress'] } });
  if (activeRide) return next(new AppError('You already have an active ride', 409));

  const ride = await rideService.createNewRide(req.user.id, req.body);
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
  const existingRequest = await RideRequest.findOne({ ride: rideId, seeker: req.user.id });
  if (existingRequest) return next(new AppError('Request already sent', 409));

  const ride = await Ride.findById(rideId);
  if (!ride || ride.status !== 'active') return next(new AppError('Ride not available', 404));

  const request = await RideRequest.create({
    ride: rideId,
    seeker: req.user.id,
    ...req.body,
    expiresAt: new Date(Date.now() + 30000), // 30 sec expiry
  });

  return formatResponse(res, 201, 'Request sent', request);
});

export const acceptRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { rideId, requestId } = req.params;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  const request = await RideRequest.findOneAndUpdate(
    { _id: requestId, ride: rideId, status: 'pending' },
    { status: 'accepted', acceptedAt: new Date(), otp: { code: otp, verified: false } },
    { new: true }
  );
  
  if (!request) return next(new AppError('Request not found or not pending', 404));

  return formatResponse(res, 200, 'Request accepted', request);
});

export const verifyPassengerOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const { otp } = req.body;
  
  const request = await RideRequest.findOne({ _id: requestId });
  if (!request || request.otp.code !== otp) return next(new AppError('Invalid OTP', 400));

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
