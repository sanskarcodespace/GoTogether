import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import { protect } from '../../middleware/authMiddleware';
import Rating from './rating.model';
import User from '../users/user.model';
import Ride from './ride.model';

const router = Router();

router.use(protect);

router.post('/:rideId/rate', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { ratedUserId, score, comment, tags } = req.body;
  const rideId = req.params.rideId;

  const existing = await Rating.findOne({ ride: rideId, rater: req.user.id, rated: ratedUserId });
  if (existing) return next(new AppError('Already rated', 400));

  const ride = await Ride.findById(rideId);
  if (!ride) return next(new AppError('Ride not found', 404));

  const isProvider = ride.provider.toString() === ratedUserId;
  const roleType = isProvider ? 'asProvider' : 'asSeeker';

  const rating = await Rating.create({
    ride: rideId,
    rater: req.user.id,
    rated: ratedUserId,
    score,
    comment,
    tags,
    raterRole: isProvider ? 'seeker' : 'provider',
  });

  const user = await User.findById(ratedUserId);
  if (user) {
    const oldAvg = user.rating?.[roleType]?.average || 0;
    const oldCount = user.rating?.[roleType]?.count || 0;
    const newAvg = (oldAvg * oldCount + score) / (oldCount + 1);

    await User.findByIdAndUpdate(ratedUserId, {
      [`rating.${roleType}.average`]: Math.round(newAvg * 10) / 10,
      [`rating.${roleType}.count`]: oldCount + 1,
    });
  }

  return formatResponse(res, 201, 'Rating submitted', rating);
}));

export default router;
