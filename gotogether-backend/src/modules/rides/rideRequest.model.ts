import mongoose, { Schema, Document } from 'mongoose';

export interface IRideRequest extends Document {
  ride: mongoose.Types.ObjectId;
  seeker: mongoose.Types.ObjectId;
  pickupLocation: {
    address: string;
    coordinates: [number, number];
  };
  dropLocation: {
    address: string;
    coordinates: [number, number];
  };
  detourDistanceKm?: number;
  estimatedFare: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'expired';
  otp: {
    code: string;
    verified: boolean;
  };
  rejectionReason?: string;
  expiresAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rideRequestSchema: Schema = new Schema(
  {
    ride: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    seeker: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pickupLocation: {
      address: { type: String, required: true },
      coordinates: { type: [Number], required: true, index: '2dsphere' },
    },
    dropLocation: {
      address: { type: String, required: true },
      coordinates: { type: [Number], required: true, index: '2dsphere' },
    },
    detourDistanceKm: Number,
    estimatedFare: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'expired'],
      default: 'pending',
      index: true,
    },
    otp: {
      code: String,
      verified: { type: Boolean, default: false },
    },
    rejectionReason: String,
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL Index
    acceptedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

// One request per seeker per ride
rideRequestSchema.index({ ride: 1, seeker: 1 }, { unique: true });
rideRequestSchema.index({ status: 1, createdAt: -1 });

const RideRequest = mongoose.model<IRideRequest>('RideRequest', rideRequestSchema);

export default RideRequest;
