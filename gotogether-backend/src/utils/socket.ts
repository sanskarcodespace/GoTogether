import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis';
import { logger } from '../server';

export const initSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Auth Middleware for Socket
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Namespaces
  const ridesNamespace = io.of('/rides');
  const trackingNamespace = io.of('/tracking');

  ridesNamespace.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`User ${userId} connected to /rides`);

    // Store socketId in Redis
    redisClient.set(`user:${userId}:socket`, socket.id);

    socket.on('join_ride_room', (rideId: string) => {
      socket.join(`ride:${rideId}`);
      logger.info(`User ${userId} joined ride room: ${rideId}`);
    });

    socket.on('disconnect', () => {
      redisClient.del(`user:${userId}:socket`);
      logger.info(`User ${userId} disconnected from /rides`);
    });
  });

  trackingNamespace.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`User ${userId} connected to /tracking`);

    socket.on('update_location', async (data: { rideId: string; lat: number; lng: number; heading: number }) => {
      // Broadcast to specific ride room
      trackingNamespace.to(`ride:${data.rideId}`).emit('provider_location', {
        userId,
        ...data,
        timestamp: Date.now(),
      });
    });

    socket.on('join_tracking_room', (rideId: string) => {
      socket.join(`ride:${rideId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User ${userId} disconnected from /tracking`);
    });
  });

  return io;
};
