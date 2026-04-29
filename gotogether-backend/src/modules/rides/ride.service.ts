import Ride, { IRide } from './ride.model';
import { AppError } from '../../utils/response';

export const createNewRide = async (providerId: string, rideData: any): Promise<IRide> => {
  const ride = await Ride.create({
    provider: providerId,
    ...rideData,
    from: {
      address: rideData.from.address,
      location: { type: 'Point', coordinates: rideData.from.coordinates },
    },
    to: {
      address: rideData.to.address,
      location: { type: 'Point', coordinates: rideData.to.coordinates },
    },
  });
  return ride;
};

export const searchRides = async (filters: any): Promise<IRide[]> => {
  const { fromLat, fromLng, toLat, toLng, vehicleType } = filters;

  // Simple geo search for rides starting near the pickup point
  const query: any = {
    'from.location': {
      $near: {
        $geometry: { type: 'Point', coordinates: [fromLng, fromLat] },
        $maxDistance: 5000, // 5km radius
      },
    },
    status: 'active',
  };

  if (vehicleType) query.vehicleType = vehicleType;

  return await Ride.find(query).populate('provider', 'firstName lastName rating profilePhoto');
};
