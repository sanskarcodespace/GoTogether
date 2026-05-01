import { calculateDistance, decodePolyline, closestPointOnSegment } from '../../utils/geo';
import { getDistance } from '../../utils/googleMaps';

export const NOT_MATCHED = { isMatch: false };

export const findNearestPointOnRoute = (point: [number, number], routePoints: [number, number][]) => {
  let minDistance = Infinity;
  let nearestPoint: [number, number] = [0, 0];
  let segmentIndex = -1;

  for (let i = 0; i < routePoints.length - 1; i++) {
    const cp = closestPointOnSegment(point, routePoints[i], routePoints[i + 1]);
    const dist = calculateDistance(point[0], point[1], cp[0], cp[1]);

    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = cp;
      segmentIndex = i;
    }
  }

  return { nearestPoint, distanceFromRoute: minDistance, segmentIndex };
};

export const calculateSeekerSegmentKm = (routePoints: [number, number][], startIndex: number, endIndex: number) => {
  let distance = 0;
  for (let i = startIndex; i < endIndex; i++) {
    distance += calculateDistance(routePoints[i][0], routePoints[i][1], routePoints[i + 1][0], routePoints[i + 1][1]);
  }
  return distance;
};

export const matchRide = async (
  seekerPickup: [number, number], // [lat, lng]
  seekerDrop: [number, number],   // [lat, lng]
  providerLiveLocation: [number, number], // [lat, lng]
  ride: { encodedPolyline: string; detourThresholdKm: number; distanceKm: number; priceAmount: number }
) => {
  try {
    const routePoints = decodePolyline(ride.encodedPolyline);

    const pickupMatch = findNearestPointOnRoute(seekerPickup, routePoints);
    if (pickupMatch.distanceFromRoute > ride.detourThresholdKm) return NOT_MATCHED;

    const dropMatch = findNearestPointOnRoute(seekerDrop, routePoints);
    if (dropMatch.distanceFromRoute > ride.detourThresholdKm) return NOT_MATCHED;

    if (dropMatch.segmentIndex <= pickupMatch.segmentIndex) return NOT_MATCHED;

    const detourKm = pickupMatch.distanceFromRoute + dropMatch.distanceFromRoute;
    const seekerSegmentKm = calculateSeekerSegmentKm(routePoints, pickupMatch.segmentIndex, dropMatch.segmentIndex);

    let fare = (seekerSegmentKm / ride.distanceKm) * ride.priceAmount;
    fare = Math.round(fare / 5) * 5; // Round to nearest 5

    let etaMinutes = 10; // Fallback
    try {
      const distanceMatrix = await getDistance(
        [`${providerLiveLocation[0]},${providerLiveLocation[1]}`],
        [`${seekerPickup[0]},${seekerPickup[1]}`]
      );
      if (distanceMatrix?.duration?.value) {
        etaMinutes = Math.round(distanceMatrix.duration.value / 60);
      }
    } catch (error) {
      console.log('Distance matrix error fallback used');
    }

    const matchScore = 100 - (detourKm * 20) + (1 / Math.max(etaMinutes, 1) * 10);

    return {
      isMatch: true,
      detourDistanceKm: Math.round(detourKm * 100) / 100,
      estimatedFare: Math.max(fare, 20), // Minimum fare ₹20
      etaMinutes,
      matchScore: Math.round(matchScore * 10) / 10,
    };
  } catch (error) {
    return NOT_MATCHED;
  }
};
