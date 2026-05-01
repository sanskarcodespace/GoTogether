"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = exports.getIO = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = __importDefault(require("../config/redis"));
const server_1 = require("../server");
// ─── JWT Auth Middleware Factory ──────────────────────────────────────────────
const makeAuthMiddleware = () => async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['token'];
    if (!token)
        return next(new Error('Authentication error: no token'));
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.data.userId = decoded.userId ?? decoded.id; // support both field names
        socket.data.role = decoded.role;
        next();
    }
    catch {
        next(new Error('Authentication error: invalid token'));
    }
};
// ─── Redis key helpers ────────────────────────────────────────────────────────
const socketKey = (userId) => `socket:${userId}`;
const SOCKET_TTL = 60 * 60 * 24; // 24 h
let ioInstance = null;
const getIO = () => {
    if (!ioInstance)
        throw new Error('Socket.io not initialized!');
    return ioInstance;
};
exports.getIO = getIO;
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
        // Enable per-message deflate compression for smaller payloads
        perMessageDeflate: {
            threshold: 1024, // only compress payloads > 1 KB
            zlibDeflateOptions: { level: 6 },
        },
    });
    ioInstance = io;
    // ── Namespaces ─────────────────────────────────────────────────────────────
    const ridesNsp = io.of('/rides');
    const trackingNsp = io.of('/tracking');
    // Apply auth middleware to EACH namespace individually (not io root)
    ridesNsp.use(makeAuthMiddleware());
    trackingNsp.use(makeAuthMiddleware());
    // ══════════════════════════════════════════════════════════════════════════
    //  /rides  ─ Ride lifecycle events
    // ══════════════════════════════════════════════════════════════════════════
    ridesNsp.on('connection', async (socket) => {
        const userId = socket.data.userId;
        server_1.logger.info(`[/rides] User ${userId} connected — socket ${socket.id}`);
        // Store socket ID in Redis (TTL 24 h)
        await redis_1.default.set(socketKey(userId), socket.id, { EX: SOCKET_TTL });
        // Confirm connection to client
        socket.emit('connected', { socketId: socket.id, userId });
        // ── Room helpers ─────────────────────────────────────────────────────────
        socket.on('join_ride_room', (rideId) => {
            socket.join(`ride:${rideId}`);
            server_1.logger.info(`[/rides] User ${userId} joined room ride:${rideId}`);
        });
        // ── ride:request  (seeker → provider) ───────────────────────────────────
        socket.on('ride:request', async (data) => {
            const providerSid = await redis_1.default.get(socketKey(data.providerId));
            if (providerSid) {
                ridesNsp.to(providerSid).emit('ride:new_request', data);
                server_1.logger.info(`[/rides] ride:request routed to provider ${data.providerId}`);
            }
            else {
                server_1.logger.warn(`[/rides] Provider ${data.providerId} is offline — ride:request dropped`);
            }
        });
        // ── ride:accept  (provider → seeker) ────────────────────────────────────
        socket.on('ride:accept', async (data) => {
            const seekerSid = await redis_1.default.get(socketKey(data.seekerId));
            if (seekerSid) {
                ridesNsp.to(seekerSid).emit('ride:accepted', data);
            }
            // Also broadcast to ride room (seeker may have joined it already)
            ridesNsp.to(`ride:${data.rideId}`).emit('ride:accepted', data);
        });
        // ── ride:reject  (provider → seeker) ────────────────────────────────────
        socket.on('ride:reject', async (data) => {
            const seekerSid = await redis_1.default.get(socketKey(data.seekerId));
            if (seekerSid) {
                ridesNsp.to(seekerSid).emit('ride:rejected', data);
            }
        });
        // ── ride:cancel  (either party → the other) ──────────────────────────────
        socket.on('ride:cancel', async (data) => {
            // Direct delivery to other party
            if (data.otherPartyId) {
                const otherSid = await redis_1.default.get(socketKey(data.otherPartyId));
                if (otherSid)
                    ridesNsp.to(otherSid).emit('ride:cancelled', data);
            }
            // Fallback: broadcast to the entire ride room
            ridesNsp.to(`ride:${data.rideId}`).emit('ride:cancelled', data);
        });
        // ── ride:complete  (provider → all passengers in room) ───────────────────
        socket.on('ride:complete', (data) => {
            ridesNsp.to(`ride:${data.rideId}`).emit('ride:completed', data);
        });
        // ── Disconnect ────────────────────────────────────────────────────────────
        socket.on('disconnect', async () => {
            await redis_1.default.del(socketKey(userId));
            server_1.logger.info(`[/rides] User ${userId} disconnected`);
        });
    });
    // ══════════════════════════════════════════════════════════════════════════
    //  /tracking  ─ GPS fallback streaming (when Firebase is unavailable)
    // ══════════════════════════════════════════════════════════════════════════
    trackingNsp.on('connection', async (socket) => {
        const userId = socket.data.userId;
        server_1.logger.info(`[/tracking] User ${userId} connected — socket ${socket.id}`);
        await redis_1.default.set(socketKey(userId), socket.id, { EX: SOCKET_TTL });
        socket.emit('connected', { socketId: socket.id });
        socket.on('join_tracking_room', (rideId) => {
            socket.join(`ride:${rideId}`);
        });
        socket.on('update_location', (data) => {
            trackingNsp.to(`ride:${data.rideId}`).emit('provider_location', {
                userId,
                ...data,
                timestamp: Date.now(),
            });
        });
        socket.on('disconnect', async () => {
            await redis_1.default.del(socketKey(userId));
            server_1.logger.info(`[/tracking] User ${userId} disconnected`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
