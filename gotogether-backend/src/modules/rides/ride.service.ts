import Ride, { IRide } from './ride.model';
import { AppError } from '../../utils/response';
import { getDirections } from '../../utils/googleMaps';
import { db as firebaseDb } from '../../config/firebase';
import { matchRide } from './matching.service';
import { withCache, CacheKey, TTL, coordHash } from '../../utils/cache';

export const createNewRide = async (providerId: string, rideData: any): Promise<IRide> => {
  const startHash = coordHash(rideData.startLocation.coordinates[0], rideData.startLocation.coordinates[1]);
  const endHash   = coordHash(rideData.endLocation.coordinates[0], rideData.endLocation.coordinates[1]);
  const routeCacheKey = CacheKey.routePolyline(startHash, endHash);

  // Cache Google Directions for 24h — identical routes reuse cached polyline
  const routeData = await withCache(routeCacheKey, TTL.ROUTE_POLYLINE, () =>
    getDirections(rideData.startLocation.coordinates, rideData.endLocation.coordinates)
  );

  const ride = await Ride.create({
    provider: providerId,
    vehicle: rideData.vehicle,
    route: {
      startLocation: {
        address: rideData.startLocation.address,
        coordinates: rideData.startLocation.coordinates,
      },
      endLocation: {
        address: rideData.endLocation.address,
        coordinates: rideData.endLocation.coordinates,
      },
      ...routeData,
    },
    seats: {
      total:     rideData.seats,
      available: rideData.seats,
    },
    price: {
      amount:   rideData.priceAmount,
      currency: 'INR',
    },
    detourThresholdKm: rideData.detourThresholdKm || 1.5,
  });

  // Sync to Firebase for real-time tracking
  await firebaseDb.ref(`active_rides/${ride._id}`).set({
    status:    'active',
    providerId,
    createdAt: Date.now(),
  });

  return ride;
};

// ─── GEO-FIRST search: cheap geo-index query → match only top 20 results ──────
export const searchRides = async (filters: any): Promise<any[]> => {
  const { pickup_lat, pickup_lng, drop_lat, drop_lng, vehicleType, maxDetourKm } = filters;
  const p_lat = parseFloat(pickup_lat);
  const p_lng = parseFloat(pickup_lng);
  const d_lat = parseFloat(drop_lat);
  const d_lng = parseFloat(drop_lng);

  // Step 1 — geo-spatial query (uses 2dsphere index, very cheap)
  // Fetch lean plain objects; select only needed fields
  const candidateRides = await Ride.find({
    'route.startLocation.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [p_lng, p_lat] },
        $maxDistance: 10_000, // 10 km
      },
    },
    status:           'active',
    'seats.available': { $gt: 0 },
    ...(vehicleType && { 'vehicle.type': vehicleType }),
  })
    .select('provider vehicle route seats price detourThresholdKm')
    .populate('provider', 'name profilePhoto rating')
    .lean()
    .limit(50); // hard cap; reduces Firebase fan-out

  // Step 2 — Expensive matching only for top 20 candidates
  const TOP_N = 20;
  const top   = candidateRides.slice(0, TOP_N);

  // Step 3 — Fetch provider live locations from Firebase in parallel
  const liveLocations = await Promise.all(
    top.map(async (ride: any) => {
      const snap = await firebaseDb.ref(`location/${ride.provider._id}`).once('value');
      if (snap.exists()) {
        const loc = snap.val();
        return [loc.latitude, loc.longitude] as [number, number];
      }
      return [
        ride.route.startLocation.coordinates[1],
        ride.route.startLocation.coordinates[0],
      ] as [number, number];
    }),
  );

  // Step 4 — Run matching algorithm in parallel across all top candidates
  const matchResults = await Promise.all(
    top.map((ride: any, idx: number) => {
      if (!ride.route.encodedPolyline) return null;
      return matchRide(
        [p_lat, p_lng],
        [d_lat, d_lng],
        liveLocations[idx],
        {
          encodedPolyline:   ride.route.encodedPolyline,
          detourThresholdKm: maxDetourKm
            ? Math.min(ride.detourThresholdKm, parseFloat(maxDetourKm))
            : ride.detourThresholdKm,
          distanceKm:  ride.route.distanceKm || 1,
          priceAmount: ride.price.amount,
        },
      ).catch(() => null);
    }),
  );

  const matches: any[] = [];
  for (let i = 0; i < top.length; i++) {
    const result = matchResults[i];
    if (!result?.isMatch) continue;
    const ride = top[i];
    matches.push({
      _id:              ride._id,
      provider:         ride.provider,
      vehicle:          ride.vehicle,
      route:            ride.route,
      price:            { amount: result.estimatedFare, currency: 'INR' },
      seats:            ride.seats,
      detourDistanceKm: result.detourDistanceKm,
      estimatedEta:     `${result.etaMinutes} mins`,
      matchScore:       result.matchScore,
    });
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
};
