"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestSchema = exports.searchRideSchema = exports.createRideSchema = void 0;
const zod_1 = require("zod");
const coordinatesSchema = zod_1.z.object({
    address: zod_1.z.string().min(3).max(200),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()])
});
exports.createRideSchema = zod_1.z.object({
    body: zod_1.z.object({
        vehicleType: zod_1.z.enum(['bike', 'car']),
        startLocation: coordinatesSchema,
        endLocation: coordinatesSchema,
        seats: zod_1.z.number().int().min(1).max(4),
        priceAmount: zod_1.z.number().min(5).max(500),
        detourThresholdKm: zod_1.z.number().min(0.5).max(5)
    }),
});
exports.searchRideSchema = zod_1.z.object({
    query: zod_1.z.object({
        pickup_lat: zod_1.z.coerce.number().min(-90).max(90),
        pickup_lng: zod_1.z.coerce.number().min(-180).max(180),
        drop_lat: zod_1.z.coerce.number().min(-90).max(90),
        drop_lng: zod_1.z.coerce.number().min(-180).max(180),
        vehicleType: zod_1.z.enum(['bike', 'car']).optional(),
        maxDetourKm: zod_1.z.coerce.number().min(0.5).max(5).optional()
    }),
});
exports.createRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        pickupLocation: coordinatesSchema,
        dropLocation: coordinatesSchema
    })
});
