import axios from 'axios';
import { AppError } from './response';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getRoute = async (origin: [number, number], destination: [number, number]) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin[0]},${origin[1]}`, // lat,lng
        destination: `${destination[0]},${destination[1]}`, // lat,lng
        key: GOOGLE_MAPS_API_KEY,
        mode: 'driving',
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Directions API error');
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance.value, // meters
      duration: leg.duration.value, // seconds
      polyline: route.overview_polyline.points, // encoded polyline
    };
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};

export const getDistance = async (origins: string[], destinations: string[]) => {
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

    return response.data; // Returns matrix
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};

export const geocodeAddress = async (address: string) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Geocoding API error');
    }

    const location = response.data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};

