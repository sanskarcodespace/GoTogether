"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRides = exports.createNewRide = void 0;
const ride_model_1 = __importDefault(require("./ride.model"));
const googleMaps_1 = require("../../utils/googleMaps");
const firebase_1 = require("../../config/firebase");
const matching_service_1 = require("./matching.service");
const cache_1 = require("../../utils/cache");
const createNewRide = async (providerId, rideData) => {
    const startHash = (0, cache_1.coordHash)(rideData.startLocation.coordinates[0], rideData.startLocation.coordinates[1]);
    const endHash = (0, cache_1.coordHash)(rideData.endLocation.coordinates[0], rideData.endLocation.coordinates[1]);
    const routeCacheKey = cache_1.CacheKey.routePolyline(startHash, endHash);
    // Cache Google Directions for 24h — identical routes reuse cached polyline
    const routeData = await (0, cache_1.withCache)(routeCacheKey, cache_1.TTL.ROUTE_POLYLINE, () => (0, googleMaps_1.getDirections)(rideData.startLocation.coordinates, rideData.endLocation.coordinates));
    const ride = await ride_model_1.default.create({
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
    await firebase_1.db.ref(`active_rides/${ride._id}`).set({
        status: 'active',
        providerId,
        createdAt: Date.now(),
    });
    return ride;
};
exports.createNewRide = createNewRide;
// ─── GEO-FIRST search: cheap geo-index query → match only top 20 results ──────
const searchRides = async (filters) => {
    const { pickup_lat, pickup_lng, drop_lat, drop_lng, vehicleType, maxDetourKm } = filters;
    const p_lat = parseFloat(pickup_lat);
    const p_lng = parseFloat(pickup_lng);
    const d_lat = parseFloat(drop_lat);
    const d_lng = parseFloat(drop_lng);
    // Step 1 — geo-spatial query (uses 2dsphere index, very cheap)
    // Fetch lean plain objects; select only needed fields
    const candidateRides = await ride_model_1.default.find({
        'route.startLocation.coordinates': {
            $near: {
                $geometry: { type: 'Point', coordinates: [p_lng, p_lat] },
                $maxDistance: 10_000, // 10 km
            },
        },
        status: 'active',
        'seats.available': { $gt: 0 },
        ...(vehicleType && { 'vehicle.type': vehicleType }),
    })
        .select('provider vehicle route seats price detourThresholdKm')
        .populate('provider', 'name profilePhoto rating')
        .lean()
        .limit(50); // hard cap; reduces Firebase fan-out
    // Step 2 — Expensive matching only for top 20 candidates
    const TOP_N = 20;
    const top = candidateRides.slice(0, TOP_N);
    // Step 3 — Fetch provider live locations from Firebase in parallel
    const liveLocations = await Promise.all(top.map(async (ride) => {
        const snap = await firebase_1.db.ref(`location/${ride.provider._id}`).once('value');
        if (snap.exists()) {
            const loc = snap.val();
            return [loc.latitude, loc.longitude];
        }
        return [
            ride.route.startLocation.coordinates[1],
            ride.route.startLocation.coordinates[0],
        ];
    }));
    // Step 4 — Run matching algorithm in parallel across all top candidates
    const matchResults = await Promise.all(top.map((ride, idx) => {
        if (!ride.route.encodedPolyline)
            return null;
        return (0, matching_service_1.matchRide)([p_lat, p_lng], [d_lat, d_lng], liveLocations[idx], {
            encodedPolyline: ride.route.encodedPolyline,
            detourThresholdKm: maxDetourKm
                ? Math.min(ride.detourThresholdKm, parseFloat(maxDetourKm))
                : ride.detourThresholdKm,
            distanceKm: ride.route.distanceKm || 1,
            priceAmount: ride.price.amount,
        }).catch(() => null);
    }));
    const matches = [];
    for (let i = 0; i < top.length; i++) {
        const result = matchResults[i];
        if (!result?.isMatch)
            continue;
        const ride = top[i];
        matches.push({
            _id: ride._id,
            provider: ride.provider,
            vehicle: ride.vehicle,
            route: ride.route,
            price: { amount: result.estimatedFare, currency: 'INR' },
            seats: ride.seats,
            detourDistanceKm: result.detourDistanceKm,
            estimatedEta: `${result.etaMinutes} mins`,
            matchScore: result.matchScore,
        });
    }
    return matches.sort((a, b) => b.matchScore - a.matchScore);
};
exports.searchRides = searchRides;
