import { Router } from 'express';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import { protect } from '../../middleware/authMiddleware';
import Rating from './rating.model';
import User from '../users/user.model';

const router = Router();

router.use(protect);

router.post('/:rideId/rate', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { ratedUserId, score, comment, tags } = req.body;
  const rideId = req.params.rideId;

  const existing = await Rating.findOne({ ride: rideId, rater: req.user.id, rated: ratedUserId });
  if (existing) return next(new AppError('Already rated', 400));

  const rating = await Rating.create({
    ride: rideId,
    rater: req.user.id,
    rated: ratedUserId,
    score,
    comment,
    tags,
    raterRole: req.user.id === ratedUserId ? 'unknown' : 'seeker', // simplified
  });

  // Update user average rating
  const stats = await Rating.aggregate([
    { $match: { rated: new mongoose.Types.ObjectId(ratedUserId) } },
    { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
  ]);

  await User.findByIdAndUpdate(ratedUserId, {
    'rating.asProvider.average': stats[0].avg,
    'rating.asProvider.count': stats[0].count,
  });

  return formatResponse(res, 201, 'Rating submitted', rating);
}));

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export default router;
