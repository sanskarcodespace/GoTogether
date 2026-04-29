import mongoose, { Schema, Document } from 'mongoose';

export interface ISosEvent extends Document {
  user: mongoose.Types.ObjectId;
  ride?: mongoose.Types.ObjectId;
  request?: mongoose.Types.ObjectId;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  status: 'active' | 'resolved';
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const sosEventSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ride: { type: Schema.Types.ObjectId, ref: 'Ride' },
    request: { type: Schema.Types.ObjectId, ref: 'RideRequest' },
    location: {
      coordinates: { type: [Number], required: true },
      address: String,
    },
    status: { type: String, enum: ['active', 'resolved'], default: 'active', index: true },
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const SosEvent = mongoose.model<ISosEvent>('SosEvent', sosEventSchema);

export default SosEvent;
