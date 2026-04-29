import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type:
    | 'ride_request'
    | 'ride_accepted'
    | 'ride_rejected'
    | 'ride_cancelled'
    | 'ride_completed'
    | 'rating_received'
    | 'system_alert'
    | 'sos_alert';
  title: string;
  body: string;
  data: any;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'ride_request',
        'ride_accepted',
        'ride_rejected',
        'ride_cancelled',
        'ride_completed',
        'rating_received',
        'system_alert',
        'sos_alert',
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '30d' } }, // TTL: 30 days
  },
  { timestamps: false }
);

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
