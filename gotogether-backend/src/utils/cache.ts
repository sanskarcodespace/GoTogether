import redisClient from '../config/redis';
import { createHash } from 'crypto';

/**
 * Hash a coordinate pair to a stable short string for cache keys.
 */
export const coordHash = (lat: number | string, lng: number | string) =>
  createHash('md5')
    .update(`${lat}|${lng}`)
    .digest('hex')
    .slice(0, 12);

// ─── Cache TTLs (seconds) ────────────────────────────────────────────────────
export const TTL = {
  SUGGESTED_PRICE: 60 * 60,      // 1 h
  USER_PUBLIC:     60 * 5,        // 5 min
  ROUTE_POLYLINE:  60 * 60 * 24, // 24 h
  ADMIN_STATS:     60,            // 1 min
} as const;

// ─── Cache Key Factories ─────────────────────────────────────────────────────
export const CacheKey = {
  suggestedPrice: (startHash: string, endHash: string, type: string) =>
    `suggested_price:${startHash}:${endHash}:${type}`,
  userPublic: (userId: string) => `user_public:${userId}`,
  routePolyline: (startHash: string, endHash: string) =>
    `route:${startHash}:${endHash}`,
  adminStats: () => `admin_stats`,
};

// ─── Cache-Aside Helpers ──────────────────────────────────────────────────────

/**
 * Try reading from Redis. On miss, execute `fetchFn`, cache the result, and return it.
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const data = await fetchFn();
  // Only cache non-null results
  if (data !== null && data !== undefined) {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  }
  return data;
}

/**
 * Invalidate (delete) one or more cache keys.
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await Promise.all(keys.map((k) => redisClient.del(k)));
}
