import { Request, Response, NextFunction } from 'express';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import User from './user.model';
import { withCache, invalidateCache, CacheKey, TTL } from '../../utils/cache';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  return formatResponse(res, 200, 'User profile fetched', { user: req.user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const {
    name, gender,
    emergencyContactName, emergencyContactPhone,
    vehicleType, vehicleModel, vehicleColor, vehiclePlate,
  } = req.body;

  const updates: any = {
    name,
    gender,
    emergencyContact: { name: emergencyContactName, phone: emergencyContactPhone },
  };

  if (req.file) {
    updates.profilePhoto = req.file.path;
  }

  if (vehicleType) {
    updates.vehicle = {
      type:        vehicleType,
      model:       vehicleModel,
      color:       vehicleColor,
      plateNumber: vehiclePlate,
    };
  }

  const [user] = await Promise.all([
    User.findByIdAndUpdate(req.user.id, updates, { new: true }),
    // Invalidate public profile cache on any profile update
    invalidateCache(CacheKey.userPublic(req.user.id)),
  ]);

  return formatResponse(res, 200, 'Profile updated', { user });
});

export const updateFCMToken = asyncHandler(async (req: Request, res: Response) => {
  const { fcmToken } = req.body;
  await User.findByIdAndUpdate(req.user.id, { fcmToken });
  return formatResponse(res, 200, 'Token updated');
});

export const getPublicProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const cacheKey = CacheKey.userPublic(userId);

  const user = await withCache(cacheKey, TTL.USER_PUBLIC, async () => {
    const result = await User.findById(userId)
      .select('name profilePhoto rating stats vehicle.type vehicle.model vehicle.color')
      .lean();
    if (!result) return null;
    return result;
  });

  if (!user) return next(new AppError('User not found', 404));
  return formatResponse(res, 200, 'Public profile fetched', user);
});
