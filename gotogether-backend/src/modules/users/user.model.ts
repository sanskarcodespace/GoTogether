import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  email?: string;
  name?: string;
  profilePhoto?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: 'user' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  vehicle?: {
    type: 'bike' | 'car';
    model: string;
    color: string;
    plateNumber: string;
    isVerified: boolean;
  };
  rating: {
    asProvider: { average: number; count: number };
    asSeeker: { average: number; count: number };
  };
  stats: {
    totalRidesAsProvider: number;
    totalRidesAsSeeker: number;
    totalEarnings: number;
  };
  emergencyContact?: {
    name: string;
    phone: string;
  };
  fcmToken?: string;
  refreshTokens: string[];
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    phone: { type: String, unique: true, required: true, index: true, trim: true },
    email: { type: String, sparse: true, trim: true, lowercase: true },
    name: { type: String, trim: true },
    profilePhoto: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
    vehicle: {
      type: { type: String, enum: ['bike', 'car'] },
      model: String,
      color: String,
      plateNumber: String,
      isVerified: { type: Boolean, default: false },
    },
    rating: {
      asProvider: {
        average: { type: Number, default: 5.0 },
        count: { type: Number, default: 0 },
      },
      asSeeker: {
        average: { type: Number, default: 5.0 },
        count: { type: Number, default: 0 },
      },
    },
    stats: {
      totalRidesAsProvider: { type: Number, default: 0 },
      totalRidesAsSeeker: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
    },
    emergencyContact: {
      name: String,
      phone: String,
    },
    fcmToken: { type: String },
    refreshTokens: [String],
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ isActive: 1, isBanned: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
