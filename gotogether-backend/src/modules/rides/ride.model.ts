import mongoose, { Schema, Document } from 'mongoose';

export interface IRide extends Document {
  provider: mongoose.Types.ObjectId;
  passengers: mongoose.Types.ObjectId[];
  vehicleType: 'bike' | 'car';
  from: {
    address: string;
    location: { type: 'Point'; coordinates: [number, number] };
  };
  to: {
    address: string;
    location: { type: 'Point'; coordinates: [number, number] };
  };
  price: number;
  seatsAvailable: number;
  status: 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
}

const rideSchema: Schema = new Schema(
  {
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    passengers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    vehicleType: { type: String, enum: ['bike', 'car'], required: true },
    from: {
      address: { type: String, required: true },
      location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    to: {
      address: { type: String, required: true },
      location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    price: { type: Number, required: true },
    seatsAvailable: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
  },
  { timestamps: true }
);

rideSchema.index({ 'from.location': '2dsphere' });
rideSchema.index({ 'to.location': '2dsphere' });

const Ride = mongoose.model<IRide>('Ride', rideSchema);

export default Ride;
