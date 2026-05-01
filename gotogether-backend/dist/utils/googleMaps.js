"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeAddress = exports.getDistance = exports.getRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("./response");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const getRoute = async (origin, destination) => {
    try {
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/directions/json', {
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
    }
    catch (error) {
        throw new response_1.AppError(error.message, 500);
    }
};
exports.getRoute = getRoute;
const getDistance = async (origins, destinations) => {
    try {
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
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
    }
    catch (error) {
        throw new response_1.AppError(error.message, 500);
    }
};
exports.getDistance = getDistance;
const geocodeAddress = async (address) => {
    try {
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/geocode/json', {
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
    }
    catch (error) {
        throw new response_1.AppError(error.message, 500);
    }
};
exports.geocodeAddress = geocodeAddress;
