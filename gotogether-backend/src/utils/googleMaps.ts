import axios from 'axios';
import { AppError } from './response';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getDirections = async (origin: [number, number], destination: [number, number]) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin[1]},${origin[0]}`, // lat,lng
        destination: `${destination[1]},${destination[0]}`,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Directions API error');
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      encodedPolyline: route.overview_polyline.points,
      distanceKm: leg.distance.value / 1000,
      durationMinutes: Math.round(leg.duration.value / 60),
    };
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};

export const getDistanceMatrix = async (origins: string[], destinations: string[]) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Distance Matrix API error');
    }

    return response.data.rows[0].elements[0];
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};
