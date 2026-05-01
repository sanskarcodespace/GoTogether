"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKey = exports.TTL = exports.coordHash = void 0;
exports.withCache = withCache;
exports.invalidateCache = invalidateCache;
const redis_1 = __importDefault(require("../config/redis"));
const crypto_1 = require("crypto");
/**
 * Hash a coordinate pair to a stable short string for cache keys.
 */
const coordHash = (lat, lng) => (0, crypto_1.createHash)('md5')
    .update(`${lat}|${lng}`)
    .digest('hex')
    .slice(0, 12);
exports.coordHash = coordHash;
// ─── Cache TTLs (seconds) ────────────────────────────────────────────────────
exports.TTL = {
    SUGGESTED_PRICE: 60 * 60, // 1 h
    USER_PUBLIC: 60 * 5, // 5 min
    ROUTE_POLYLINE: 60 * 60 * 24, // 24 h
    ADMIN_STATS: 60, // 1 min
};
// ─── Cache Key Factories ─────────────────────────────────────────────────────
exports.CacheKey = {
    suggestedPrice: (startHash, endHash, type) => `suggested_price:${startHash}:${endHash}:${type}`,
    userPublic: (userId) => `user_public:${userId}`,
    routePolyline: (startHash, endHash) => `route:${startHash}:${endHash}`,
    adminStats: () => `admin_stats`,
};
// ─── Cache-Aside Helpers ──────────────────────────────────────────────────────
/**
 * Try reading from Redis. On miss, execute `fetchFn`, cache the result, and return it.
 */
async function withCache(key, ttl, fetchFn) {
    const cached = await redis_1.default.get(key);
    if (cached) {
        return JSON.parse(cached);
    }
    const data = await fetchFn();
    // Only cache non-null results
    if (data !== null && data !== undefined) {
        await redis_1.default.set(key, JSON.stringify(data), { EX: ttl });
    }
    return data;
}
/**
 * Invalidate (delete) one or more cache keys.
 */
async function invalidateCache(...keys) {
    if (keys.length === 0)
        return;
    await Promise.all(keys.map((k) => redis_1.default.del(k)));
}
