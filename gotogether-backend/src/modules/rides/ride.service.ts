import Ride, { IRide } from './ride.model';
import { AppError } from '../../utils/response';
import { getDirections } from '../../utils/googleMaps';
import { db as firebaseDb } from '../../config/firebase';
import { matchRide } from './matching.service';

export const createNewRide = async (providerId: string, rideData: any): Promise<IRide> => {
  // Get route data from Google
  const routeData = await getDirections(
    rideData.from.coordinates,
    rideData.to.coordinates
  );

  const ride = await Ride.create({
    provider: providerId,
    vehicle: rideData.vehicle,
    route: {
      startLocation: {
        address: rideData.from.address,
        coordinates: rideData.from.coordinates,
      },
      endLocation: {
        address: rideData.to.address,
        coordinates: rideData.to.coordinates,
      },
      ...routeData,
    },
    seats: {
      total: rideData.seats,
      available: rideData.seats,
    },
    price: {
      amount: rideData.priceAmount,
      currency: 'INR',
    },
    detourThresholdKm: rideData.detourThresholdKm || 1.5,
  });

  // Sync to Firebase for real-time tracking
  await firebaseDb.ref(`active_rides/${ride._id}`).set({
    status: 'active',
    providerId,
    createdAt: Date.now(),
  });

  return ride;
};

export const searchRides = async (filters: any): Promise<any[]> => {
  const { pickup_lat, pickup_lng, drop_lat, drop_lng, vehicleType } = filters;
  const p_lat = parseFloat(pickup_lat);
  const p_lng = parseFloat(pickup_lng);
  const d_lat = parseFloat(drop_lat);
  const d_lng = parseFloat(drop_lng);

  // 1. Initial Geospatial Query: Find rides starting near pickup (within 10km)
  const candidateRides = await Ride.find({
    'route.startLocation.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [p_lng, p_lat] },
        $maxDistance: 10000,
      },
    },
    status: 'active',
    'seats.available': { $gt: 0 },
    ...(vehicleType && { 'vehicle.type': vehicleType }),
  }).populate('provider', 'name profilePhoto rating');

  const matches: any[] = [];

  for (const ride of candidateRides) {
    if (!ride.route.encodedPolyline) continue;

    // Fetch live location of provider from Firebase
    const providerSnapshot = await firebaseDb.ref(`location/${ride.provider._id}`).once('value');
    let liveLocation: [number, number] = [ride.route.startLocation.coordinates[1], ride.route.startLocation.coordinates[0]];
    if (providerSnapshot.exists()) {
      const loc = providerSnapshot.val();
      liveLocation = [loc.latitude, loc.longitude];
    }

    // 2. Matching Algorithm Logic
    const matchResult = await matchRide(
      [p_lat, p_lng],
      [d_lat, d_lng],
      liveLocation,
      {
        encodedPolyline: ride.route.encodedPolyline,
        detourThresholdKm: ride.detourThresholdKm,
        distanceKm: ride.route.distanceKm || 1,
        priceAmount: ride.price.amount,
      }
    );

    if (!matchResult.isMatch) continue;

    matches.push({
      _id: ride._id,
      provider: ride.provider,
      vehicle: ride.vehicle,
      route: ride.route,
      price: { amount: matchResult.estimatedFare, currency: 'INR' },
      seats: ride.seats,
      detourDistanceKm: matchResult.detourDistanceKm,
      estimatedEta: `${matchResult.etaMinutes} mins`,
      matchScore: matchResult.matchScore,
    });
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
};
