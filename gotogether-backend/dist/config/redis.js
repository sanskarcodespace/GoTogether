"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const server_1 = require("../server");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.on('error', (err) => server_1.logger.error('Redis Client Error', err));
redisClient.on('connect', () => server_1.logger.info('Connected to Redis'));
(async () => {
    if (process.env.REDIS_URL) {
        await redisClient.connect();
    }
})();
exports.default = redisClient;
