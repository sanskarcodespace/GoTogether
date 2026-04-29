import { Request, Response, NextFunction } from 'express';
import { asyncHandler, formatResponse, AppError } from '../../utils/response';
import User from './user.model';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  return formatResponse(res, 200, 'User profile fetched', { user: req.user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, gender, emergencyContactName, emergencyContactPhone, vehicleType, vehicleModel, vehicleColor, vehiclePlate } = req.body;
  
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
      type: vehicleType,
      model: vehicleModel,
      color: vehicleColor,
      plateNumber: vehiclePlate,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
  return formatResponse(res, 200, 'Profile updated', { user });
});

export const updateFCMToken = asyncHandler(async (req: Request, res: Response) => {
  const { fcmToken } = req.body;
  await User.findByIdAndUpdate(req.user.id, { fcmToken });
  return formatResponse(res, 200, 'Token updated');
});

export const getPublicProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.userId).select('name profilePhoto rating stats vehicle');
  if (!user) return next(new AppError('User not found', 404));
  return formatResponse(res, 200, 'Public profile fetched', user);
});
