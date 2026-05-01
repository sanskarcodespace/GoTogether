"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRideHistory = exports.verifyPassengerOTP = exports.rejectRequest = exports.acceptRequest = exports.requestRide = exports.cancelRide = exports.completeRide = exports.startRide = exports.sendSOS = exports.getLiveStatus = exports.getRideDetails = exports.getActiveRide = exports.getAvailableRides = exports.createRide = exports.getSuggestedPrice = void 0;
const rideService = __importStar(require("./ride.service"));
const response_1 = require("../../utils/response");
const ride_model_1 = __importDefault(require("./ride.model"));
const rideRequest_model_1 = __importDefault(require("./rideRequest.model"));
const googleMaps_1 = require("../../utils/googleMaps");
const socket_1 = require("../../utils/socket");
const redis_1 = __importDefault(require("../../config/redis"));
const cache_1 = require("../../utils/cache");
exports.getSuggestedPrice = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { startLat, startLng, endLat, endLng, type } = req.query;
    if (!startLat || !startLng || !endLat || !endLng || !type) {
        return next(new response_1.AppError('Missing parameters', 400));
    }
    const startHash = (0, cache_1.coordHash)(startLat, startLng);
    const endHash = (0, cache_1.coordHash)(endLat, endLng);
    const cacheKey = cache_1.CacheKey.suggestedPrice(startHash, endHash, type);
    const result = await (0, cache_1.withCache)(cacheKey, cache_1.TTL.SUGGESTED_PRICE, async () => {
        const distanceMatrix = await (0, googleMaps_1.getDistance)([`${startLat},${startLng}`], [`${endLat},${endLng}`]);
        if (!distanceMatrix || distanceMatrix.status !== 'OK') {
            throw new response_1.AppError('Could not calculate distance', 500);
        }
        const distanceKm = distanceMatrix.distance.value / 1000;
        let suggestedPrice = type === 'car'
            ? 50 + distanceKm * 10
            : 20 + distanceKm * 5;
        suggestedPrice = Math.round(suggestedPrice / 5) * 5;
        return {
            suggestedPrice,
            distanceKm: Math.round(distanceKm * 10) / 10,
            durationMinutes: Math.round(distanceMatrix.duration.value / 60),
        };
    });
    return (0, response_1.formatResponse)(res, 200, 'Suggested price calculated', result);
});
exports.createRide = (0, response_1.asyncHandler)(async (req, res, next) => {
    if (!req.user.vehicle?.plateNumber) {
        return next(new response_1.AppError('Please set up your vehicle details first', 403));
    }
    const activeRide = await ride_model_1.default.findOne({ provider: req.user.id, status: { $in: ['active', 'in_progress'] } });
    if (activeRide)
        return next(new response_1.AppError('You already have an active ride', 409));
    // Check if locations are within India (approximate bounding box)
    const inIndia = (lat, lng) => lat >= 8 && lat <= 38 && lng >= 68 && lng <= 98;
    const { startLocation, endLocation } = req.body;
    if (!inIndia(startLocation.coordinates[0], startLocation.coordinates[1]) ||
        !inIndia(endLocation.coordinates[0], endLocation.coordinates[1])) {
        return next(new response_1.AppError('Location outside service area', 400));
    }
    const ride = await rideService.createNewRide(req.user.id, req.body);
    // Broadcast to all seekers
    (0, socket_1.getIO)().of('/rides').emit('new_ride_available', ride);
    return (0, response_1.formatResponse)(res, 201, 'Ride created successfully', ride);
});
exports.getAvailableRides = (0, response_1.asyncHandler)(async (req, res) => {
    const rides = await rideService.searchRides(req.query);
    return (0, response_1.formatResponse)(res, 200, 'Rides fetched successfully', rides);
});
exports.getActiveRide = (0, response_1.asyncHandler)(async (req, res) => {
    const ride = await ride_model_1.default.findOne({
        $or: [{ provider: req.user.id }, { 'passengers.seeker': req.user.id }],
        status: { $in: ['active', 'in_progress'] },
    })
        .select('provider vehicle route seats price status passengers detourThresholdKm')
        .populate('provider', 'name profilePhoto rating vehicle.type vehicle.plateNumber')
        .populate('passengers.seeker', 'name profilePhoto')
        .lean();
    return (0, response_1.formatResponse)(res, 200, 'Active ride fetched', ride);
});
exports.getRideDetails = (0, response_1.asyncHandler)(async (req, res, next) => {
    const ride = await ride_model_1.default.findById(req.params.rideId)
        .populate('provider', 'name profilePhoto rating vehicle stats')
        .populate('passengers.seeker', 'name profilePhoto rating')
        .lean();
    if (!ride)
        return next(new response_1.AppError('Ride not found', 404));
    return (0, response_1.formatResponse)(res, 200, 'Ride details fetched', ride);
});
const firebase_1 = require("../../config/firebase");
const notification_service_1 = require("../notifications/notification.service");
const sms_1 = require("../../utils/sms");
exports.getLiveStatus = (0, response_1.asyncHandler)(async (req, res, next) => {
    const ride = await ride_model_1.default.findById(req.params.rideId).populate('provider', 'name');
    if (!ride)
        return next(new response_1.AppError('Ride not found', 404));
    const providerSnapshot = await firebase_1.db.ref(`active_rides/${ride._id}/provider_location`).once('value');
    let providerLocation = null;
    if (providerSnapshot.exists()) {
        providerLocation = providerSnapshot.val();
    }
    return (0, response_1.formatResponse)(res, 200, 'Live status fetched', {
        status: ride.status,
        provider: { name: ride.provider.name },
        providerLocation,
        // ETA could be calculated on client or we can fetch Distance Matrix here
    });
});
exports.sendSOS = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { rideId, lat, lng } = req.body;
    // Create SOS event in DB (omitted complex schema, assume logged in a generic alerts collection or just logged)
    console.log(`[SOS ALERT] User ${req.user.id} activated SOS at [${lat}, ${lng}] for ride ${rideId}`);
    // Send FCM to all admin users (mock topic)
    await (0, notification_service_1.sendPushNotification)('admin_alerts', '🚨 SOS ALERT', `User ${req.user.name} requires emergency assistance!`, { type: 'SOS_ALERT', rideId, lat: String(lat), lng: String(lng) });
    // Send SMS to user's emergency contact
    if (req.user.emergencyContact?.phone) {
        try {
            await (0, sms_1.sendSMS)(req.user.emergencyContact.phone, `EMERGENCY SOS: ${req.user.name} has activated SOS on GoTogether at https://maps.google.com/?q=${lat},${lng}. Please check on them immediately.`);
        }
        catch (e) {
            console.log('Failed to send SOS SMS');
        }
    }
    return (0, response_1.formatResponse)(res, 200, 'SOS Sent — Help is coming');
});
exports.startRide = (0, response_1.asyncHandler)(async (req, res, next) => {
    const ride = await ride_model_1.default.findOneAndUpdate({ _id: req.params.rideId, provider: req.user.id, status: 'active' }, { status: 'in_progress', startedAt: new Date() }, { new: true });
    if (!ride)
        return next(new response_1.AppError('Ride cannot be started', 400));
    return (0, response_1.formatResponse)(res, 200, 'Ride started', ride);
});
exports.completeRide = (0, response_1.asyncHandler)(async (req, res, next) => {
    const ride = await ride_model_1.default.findOneAndUpdate({ _id: req.params.rideId, provider: req.user.id, status: 'in_progress' }, { status: 'completed', completedAt: new Date() }, { new: true });
    if (!ride)
        return next(new response_1.AppError('Ride cannot be completed', 400));
    return (0, response_1.formatResponse)(res, 200, 'Ride completed', ride);
});
exports.cancelRide = (0, response_1.asyncHandler)(async (req, res, next) => {
    const ride = await ride_model_1.default.findOneAndUpdate({ _id: req.params.rideId, provider: req.user.id, status: { $in: ['active', 'in_progress'] } }, { status: 'cancelled', cancelledAt: new Date(), cancelReason: req.body.reason }, { new: true });
    if (!ride)
        return next(new response_1.AppError('Ride cannot be cancelled', 400));
    return (0, response_1.formatResponse)(res, 200, 'Ride cancelled', ride);
});
// Requests Logic
exports.requestRide = (0, response_1.asyncHandler)(async (req, res, next) => {
    const rideId = req.params.rideId;
    const existingRequest = await rideRequest_model_1.default.findOne({ ride: rideId, seeker: req.user.id, status: { $in: ['pending', 'accepted'] } });
    if (existingRequest)
        return next(new response_1.AppError('Request already sent', 409));
    const seekerActiveRide = await ride_model_1.default.findOne({ 'passengers.seeker': req.user.id, status: { $in: ['active', 'in_progress'] } });
    if (seekerActiveRide)
        return next(new response_1.AppError('You already have an active ride', 409));
    const ride = await ride_model_1.default.findById(rideId).populate('provider', 'name');
    if (!ride || ride.status !== 'active')
        return next(new response_1.AppError('Ride not available', 404));
    if (ride.provider._id.toString() === req.user.id) {
        return next(new response_1.AppError('You cannot request your own ride', 400));
    }
    if (ride.seats.available <= 0) {
        return next(new response_1.AppError('Ride is full', 409));
    }
    const request = await rideRequest_model_1.default.create({
        ride: rideId,
        seeker: req.user.id,
        ...req.body,
        expiresAt: new Date(Date.now() + 30_000),
    });
    // Notify provider via socket (server-side relay)
    const providerSid = await redis_1.default.get(`socket:${ride.provider._id}`);
    if (providerSid) {
        (0, socket_1.getIO)().of('/rides').to(providerSid).emit('ride:new_request', {
            rideId,
            requestId: String(request._id),
            seeker: {
                _id: req.user.id,
                name: req.user.name,
                profilePhoto: req.user.profilePhoto,
            },
            ...req.body,
        });
    }
    return (0, response_1.formatResponse)(res, 201, 'Request sent', request);
});
exports.acceptRequest = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { rideId, requestId } = req.params;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const request = await rideRequest_model_1.default.findOneAndUpdate({ _id: requestId, ride: rideId, status: 'pending' }, { status: 'accepted', acceptedAt: new Date(), otp: { code: otp, verified: false } }, { new: true });
    if (!request)
        return next(new response_1.AppError('Request not found or not pending', 404));
    // Parallelize: decrement seat count + notify seeker concurrently
    const [seekerSid] = await Promise.all([
        redis_1.default.get(`socket:${request.seeker}`),
        ride_model_1.default.updateOne({ _id: rideId }, { $inc: { 'seats.available': -1 } }),
    ]);
    if (seekerSid) {
        (0, socket_1.getIO)().of('/rides').to(seekerSid).emit('ride:accepted', {
            rideId,
            requestId,
            seekerId: String(request.seeker),
            otp,
            providerLocation: null,
        });
    }
    // Also broadcast to ride room (provider + seeker both joined it)
    (0, socket_1.getIO)().of('/rides').to(`ride:${rideId}`).emit('ride:accepted', {
        rideId, requestId, otp,
    });
    return (0, response_1.formatResponse)(res, 200, 'Request accepted', request);
});
exports.rejectRequest = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { rideId, requestId } = req.params;
    const { reason = 'Request declined by provider' } = req.body;
    const request = await rideRequest_model_1.default.findOneAndUpdate({ _id: requestId, ride: rideId, status: 'pending' }, { status: 'rejected', rejectedAt: new Date() }, { new: true });
    if (!request)
        return next(new response_1.AppError('Request not found or not pending', 404));
    // Notify seeker via socket (server-side relay)
    const seekerSid = await redis_1.default.get(`socket:${request.seeker}`);
    if (seekerSid) {
        (0, socket_1.getIO)().of('/rides').to(seekerSid).emit('ride:rejected', {
            rideId,
            requestId,
            reason,
        });
    }
    return (0, response_1.formatResponse)(res, 200, 'Request rejected');
});
exports.verifyPassengerOTP = (0, response_1.asyncHandler)(async (req, res, next) => {
    const { requestId } = req.params;
    const { otp } = req.body;
    const request = await rideRequest_model_1.default.findOne({ _id: requestId });
    if (!request)
        return next(response_1.AppError.notFound('Ride request'));
    if (request.otp.verified) {
        return next(response_1.AppError.conflict('Passenger already verified'));
    }
    const ride = await ride_model_1.default.findById(request.ride);
    if (!ride || ride.status === 'cancelled' || ride.status === 'completed') {
        return next(response_1.AppError.badRequest('Ride is no longer active'));
    }
    const attemptsKey = `passenger_otp_attempts:${requestId}`;
    const attempts = await redis_1.default.get(attemptsKey);
    if (attempts && parseInt(attempts) >= 3) {
        return next(response_1.AppError.tooManyRequests('Too many failed attempts. Please contact support.'));
    }
    if (request.otp.code !== otp) {
        await redis_1.default.incr(attemptsKey);
        await redis_1.default.expire(attemptsKey, 900); // 15 mins block
        return next(response_1.AppError.badRequest('Invalid OTP'));
    }
    await redis_1.default.del(attemptsKey);
    request.otp.verified = true;
    await request.save();
    // Add to ride passengers
    await ride_model_1.default.findByIdAndUpdate(request.ride, {
        $push: {
            passengers: {
                seeker: request.seeker,
                request: request._id,
                status: 'accepted',
                pickupLocation: request.pickupLocation,
                dropLocation: request.dropLocation,
                fareAmount: request.estimatedFare,
            },
        },
        $inc: { 'seats.available': -1 },
    });
    return (0, response_1.formatResponse)(res, 200, 'OTP verified, passenger boarded');
});
exports.getRideHistory = (0, response_1.asyncHandler)(async (req, res) => {
    const role = req.query.role || 'seeker';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const query = role === 'provider'
        ? { provider: req.user.id, status: { $in: ['completed', 'cancelled'] } }
        : { 'passengers.seeker': req.user.id, status: { $in: ['completed', 'cancelled'] } };
    // Fetch rides + total count in parallel
    const [rides, total] = await Promise.all([
        ride_model_1.default.find(query)
            .select('route price status seats vehicle createdAt completedAt cancelledAt passengers')
            .populate('provider', 'name profilePhoto rating')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ride_model_1.default.countDocuments(query),
    ]);
    return (0, response_1.formatResponse)(res, 200, 'History fetched', rides, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
});
