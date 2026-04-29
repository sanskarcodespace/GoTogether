import mongoose, { Schema, Document } from 'mongoose';

export interface IRide extends Document {
  provider: mongoose.Types.ObjectId;
  vehicle: {
    type: 'bike' | 'car';
    model?: string;
    plateNumber?: string;
  };
  route: {
    startLocation: {
      address: string;
      coordinates: [number, number]; // [lng, lat]
    };
    endLocation: {
      address: string;
      coordinates: [number, number];
    };
    encodedPolyline?: string;
    distanceKm?: number;
    durationMinutes?: number;
  };
  seats: {
    total: number;
    available: number;
  };
  price: {
    amount: number;
    currency: string;
    pricePerKm?: number;
  };
  detourThresholdKm: number;
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  passengers: {
    seeker: mongoose.Types.ObjectId;
    request: mongoose.Types.ObjectId;
    status: 'accepted' | 'completed';
    pickupLocation: { address: string; coordinates: [number, number] };
    dropLocation: { address: string; coordinates: [number, number] };
    fareAmount: number;
    boardedAt?: Date;
    droppedAt?: Date;
  }[];
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rideSchema: Schema = new Schema(
  {
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
        seeker: { type: Schema.Types.ObjectId, ref: 'User' },
        request: { type: Schema.Types.ObjectId, ref: 'RideRequest' },
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
  },
  { timestamps: true }
);

// Indexes
rideSchema.index({ status: 1, createdAt: -1 });
rideSchema.index({ provider: 1, status: 1 });

const Ride = mongoose.model<IRide>('Ride', rideSchema);

export default Ride;
