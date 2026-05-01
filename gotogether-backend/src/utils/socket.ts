import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis';
import { logger } from '../server';

// ─── JWT Auth Middleware Factory ──────────────────────────────────────────────
const makeAuthMiddleware = () => async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['token'];
  if (!token) return next(new Error('Authentication error: no token'));

  try {
    const decoded: any = jwt.verify(token as string, process.env.JWT_ACCESS_SECRET as string);
    socket.data.userId = decoded.id;
    socket.data.role   = decoded.role;
    next();
  } catch {
    next(new Error('Authentication error: invalid token'));
  }
};

// ─── Redis key helpers ────────────────────────────────────────────────────────
const socketKey  = (userId: string) => `socket:${userId}`;
const SOCKET_TTL = 60 * 60 * 24; // 24 h

export const initSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // ── Namespaces ─────────────────────────────────────────────────────────────
  const ridesNsp    = io.of('/rides');
  const trackingNsp = io.of('/tracking');

  // Apply auth middleware to EACH namespace individually (not io root)
  ridesNsp.use(makeAuthMiddleware());
  trackingNsp.use(makeAuthMiddleware());

  // ══════════════════════════════════════════════════════════════════════════
  //  /rides  ─ Ride lifecycle events
  // ══════════════════════════════════════════════════════════════════════════
  ridesNsp.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId as string;
    logger.info(`[/rides] User ${userId} connected — socket ${socket.id}`);

    // Store socket ID in Redis (TTL 24 h)
    await redisClient.set(socketKey(userId), socket.id, { EX: SOCKET_TTL });

    // Confirm connection to client
    socket.emit('connected', { socketId: socket.id, userId });

    // ── Room helpers ─────────────────────────────────────────────────────────
    socket.on('join_ride_room', (rideId: string) => {
      socket.join(`ride:${rideId}`);
      logger.info(`[/rides] User ${userId} joined room ride:${rideId}`);
    });

    // ── ride:request  (seeker → provider) ───────────────────────────────────
    socket.on(
      'ride:request',
      async (data: { rideId: string; requestId: string; providerId: string; seeker: any }) => {
        const providerSid = await redisClient.get(socketKey(data.providerId));
        if (providerSid) {
          ridesNsp.to(providerSid).emit('ride:new_request', data);
          logger.info(`[/rides] ride:request routed to provider ${data.providerId}`);
        } else {
          logger.warn(`[/rides] Provider ${data.providerId} is offline — ride:request dropped`);
        }
      },
    );

    // ── ride:accept  (provider → seeker) ────────────────────────────────────
    socket.on(
      'ride:accept',
      async (data: {
        rideId: string;
        requestId: string;
        seekerId: string;
        otp: string;
        providerLocation: { lat: number; lng: number };
      }) => {
        const seekerSid = await redisClient.get(socketKey(data.seekerId));
        if (seekerSid) {
          ridesNsp.to(seekerSid).emit('ride:accepted', data);
        }
        // Also broadcast to ride room (seeker may have joined it already)
        ridesNsp.to(`ride:${data.rideId}`).emit('ride:accepted', data);
      },
    );

    // ── ride:reject  (provider → seeker) ────────────────────────────────────
    socket.on(
      'ride:reject',
      async (data: { rideId: string; requestId: string; seekerId: string; reason: string }) => {
        const seekerSid = await redisClient.get(socketKey(data.seekerId));
        if (seekerSid) {
          ridesNsp.to(seekerSid).emit('ride:rejected', data);
        }
      },
    );

    // ── ride:cancel  (either party → the other) ──────────────────────────────
    socket.on(
      'ride:cancel',
      async (data: {
        rideId: string;
        by: 'provider' | 'seeker';
        reason: string;
        otherPartyId: string;
      }) => {
        // Direct delivery to other party
        if (data.otherPartyId) {
          const otherSid = await redisClient.get(socketKey(data.otherPartyId));
          if (otherSid) ridesNsp.to(otherSid).emit('ride:cancelled', data);
        }
        // Fallback: broadcast to the entire ride room
        ridesNsp.to(`ride:${data.rideId}`).emit('ride:cancelled', data);
      },
    );

    // ── ride:complete  (provider → all passengers in room) ───────────────────
    socket.on('ride:complete', (data: { rideId: string }) => {
      ridesNsp.to(`ride:${data.rideId}`).emit('ride:completed', data);
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      await redisClient.del(socketKey(userId));
      logger.info(`[/rides] User ${userId} disconnected`);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  /tracking  ─ GPS fallback streaming (when Firebase is unavailable)
  // ══════════════════════════════════════════════════════════════════════════
  trackingNsp.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId as string;
    logger.info(`[/tracking] User ${userId} connected — socket ${socket.id}`);

    await redisClient.set(socketKey(userId), socket.id, { EX: SOCKET_TTL });

    socket.emit('connected', { socketId: socket.id });

    socket.on('join_tracking_room', (rideId: string) => {
      socket.join(`ride:${rideId}`);
    });

    socket.on(
      'update_location',
      (data: { rideId: string; lat: number; lng: number; heading: number; speed: number }) => {
        trackingNsp.to(`ride:${data.rideId}`).emit('provider_location', {
          userId,
          ...data,
          timestamp: Date.now(),
        });
      },
    );

    socket.on('disconnect', async () => {
      await redisClient.del(socketKey(userId));
      logger.info(`[/tracking] User ${userId} disconnected`);
    });
  });

  return io;
};
