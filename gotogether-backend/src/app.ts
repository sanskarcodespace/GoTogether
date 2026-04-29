import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler';
import { AppError } from './utils/response';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import rideRoutes from './modules/rides/ride.routes';
import ratingRoutes from './modules/rides/rating.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import sosRoutes from './modules/admin/sos.routes';
import adminRoutes from './modules/admin/admin.routes';

dotenv.config();

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(hpp());
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Standard Middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('dev'));

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
