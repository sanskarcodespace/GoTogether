import { z } from 'zod';

export const createRideSchema = z.object({
  body: z.object({
    vehicleType: z.enum(['bike', 'car']),
    from: z.object({
      address: z.string(),
      coordinates: z.array(z.number()).length(2),
    }),
    to: z.object({
      address: z.string(),
      coordinates: z.array(z.number()).length(2),
    }),
    price: z.number().min(0),
    seatsAvailable: z.number().min(1).max(4),
  }),
});

export const searchRideSchema = z.object({
  query: z.object({
    fromLat: z.string().transform(Number),
    fromLng: z.string().transform(Number),
    toLat: z.string().transform(Number),
    toLng: z.string().transform(Number),
    vehicleType: z.enum(['bike', 'car']).optional(),
  }),
});
