import { createClient } from 'redis';
import { logger } from '../server';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Connected to Redis'));

(async () => {
  if (process.env.REDIS_URL) {
    await redisClient.connect();
  }
})();

export default redisClient;
