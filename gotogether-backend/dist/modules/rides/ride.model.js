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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const rideSchema = new mongoose_1.Schema({
    provider: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: {
        type: { type: String, enum: ['bike', 'car'], required: true },
        model: String,
        plateNumber: String,
    },
    route: {
        startLocation: {
            address: { type: String, required: true },
            coordinates: { type: [Number], required: true, index: '2dsphere' },
        },
        endLocation: {
            address: { type: String, required: true },
            coordinates: { type: [Number], required: true, index: '2dsphere' },
        },
        encodedPolyline: String,
        distanceKm: Number,
        durationMinutes: Number,
    },
    seats: {
        total: { type: Number, default: 1 },
        available: { type: Number, default: 1 },
    },
    price: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        pricePerKm: Number,
    },
    detourThresholdKm: { type: Number, default: 1.5 },
    status: {
        type: String,
        enum: ['active', 'in_progress', 'completed', 'cancelled'],
        default: 'active',
        index: true,
    },
    passengers: [
        {
            seeker: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            request: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RideRequest' },
            status: { type: String, enum: ['accepted', 'completed'] },
            pickupLocation: {
                address: String,
                coordinates: [Number],
            },
            dropLocation: {
                address: String,
                coordinates: [Number],
            },
            fareAmount: Number,
            boardedAt: Date,
            droppedAt: Date,
        },
    ],
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
}, { timestamps: true });
// Indexes
rideSchema.index({ status: 1, createdAt: -1 });
rideSchema.index({ provider: 1, status: 1 });
const Ride = mongoose_1.default.model('Ride', rideSchema);
exports.default = Ride;
