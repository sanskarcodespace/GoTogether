import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  ride: mongoose.Types.ObjectId;
  request?: mongoose.Types.ObjectId;
  rater: mongoose.Types.ObjectId;
  rated: mongoose.Types.ObjectId;
  raterRole: 'provider' | 'seeker';
  score: number;
  comment?: string;
  tags: string[];
  createdAt: Date;
}

const ratingSchema: Schema = new Schema(
  {
    ride: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
    request: { type: Schema.Types.ObjectId, ref: 'RideRequest' },
    rater: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rated: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    raterRole: { type: String, enum: ['provider', 'seeker'], required: true },
    score: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500 },
    tags: [
      {
        type: String,
        enum: ['punctual', 'safe_driving', 'friendly', 'clean_vehicle', 'on_time'],
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One rating per direction per ride
ratingSchema.index({ ride: 1, rater: 1, rated: 1 }, { unique: true });
ratingSchema.index({ rated: 1, raterRole: 1 });

const Rating = mongoose.model<IRating>('Rating', ratingSchema);

export default Rating;
