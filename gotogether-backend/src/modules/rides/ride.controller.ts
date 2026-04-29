import { Request, Response, NextFunction } from 'express';
import * as rideService from './ride.service';
import { asyncHandler, formatResponse } from '../../utils/response';

export const createRide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ride = await rideService.createNewRide(req.user.id, req.body);
  return formatResponse(res, 201, 'Ride created successfully', ride);
});

export const getAvailableRides = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const rides = await rideService.searchRides(req.query);
  return formatResponse(res, 200, 'Rides fetched successfully', rides);
});
