import { z } from 'zod';

const coordinatesSchema = z.object({
  address: z.string().min(3).max(200),
  coordinates: z.tuple([z.number(), z.number()])
});

export const createRideSchema = z.object({
  body: z.object({
    vehicleType: z.enum(['bike', 'car']),
    startLocation: coordinatesSchema,
    endLocation: coordinatesSchema,
    seats: z.number().int().min(1).max(4),
    priceAmount: z.number().min(5).max(500),
    detourThresholdKm: z.number().min(0.5).max(5)
  }),
});

export const searchRideSchema = z.object({
  query: z.object({
    pickup_lat: z.coerce.number().min(-90).max(90),
    pickup_lng: z.coerce.number().min(-180).max(180),
    drop_lat: z.coerce.number().min(-90).max(90),
    drop_lng: z.coerce.number().min(-180).max(180),
    vehicleType: z.enum(['bike', 'car']).optional(),
    maxDetourKm: z.coerce.number().min(0.5).max(5).optional()
  }),
});

export const createRequestSchema = z.object({
  body: z.object({
    pickupLocation: coordinatesSchema,
    dropLocation: coordinatesSchema
  })
});
