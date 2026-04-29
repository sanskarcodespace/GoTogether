import Ride, { IRide } from './ride.model';
import { AppError } from '../../utils/response';
import { getDirections } from '../../utils/googleMaps';
import { decodePolyline, isPointNearPolyline, calculateDistance } from '../../utils/geo';
import { db as firebaseDb } from '../../config/firebase';

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

  // 1. Initial Geospatial Query: Find rides starting near pickup (within 5km)
  const candidateRides = await Ride.find({
    'route.startLocation.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [p_lng, p_lat] },
        $maxDistance: 5000,
      },
    },
    status: 'active',
    'seats.available': { $gt: 0 },
    ...(vehicleType && { 'vehicle.type': vehicleType }),
  }).populate('provider', 'name profilePhoto rating');

  const matches: any[] = [];

  for (const ride of candidateRides) {
    if (!ride.route.encodedPolyline) continue;

    // 2. Matching Algorithm Logic
    const polylinePoints = decodePolyline(ride.route.encodedPolyline);
    
    // Check if pickup is near the route
    const pickupCheck = isPointNearPolyline([p_lat, p_lng], polylinePoints, ride.detourThresholdKm);
    if (!pickupCheck.isNear) continue;

    // Check if drop is near the route
    const dropCheck = isPointNearPolyline([d_lat, d_lng], polylinePoints, ride.detourThresholdKm);
    if (!dropCheck.isNear) continue;

    // TODO: Verify direction (seeker drop is after pickup on provider's route)
    // Simplified: Seeker segment distance
    const seekerDistance = calculateDistance(p_lat, p_lng, d_lat, d_lng);
    
    // Calculate estimated fare
    const fare = Math.round((ride.price.amount / ride.route.distanceKm!) * seekerDistance);

    matches.push({
      _id: ride._id,
      provider: ride.provider,
      vehicle: ride.vehicle,
      route: ride.route,
      price: { amount: fare, currency: 'INR' },
      seats: ride.seats,
      detourDistanceKm: pickupCheck.minDistance + dropCheck.minDistance,
      estimatedEta: '10 mins', // Placeholder for actual Traffic API logic
    });
  }

  return matches.sort((a, b) => a.detourDistanceKm - b.detourDistanceKm);
};
