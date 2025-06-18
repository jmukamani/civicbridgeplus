const Redis = require('ioredis');
const logger = require('../utils/logger');

// Create Redis client instance
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Event listeners
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

// Test connection function
const checkRedisConnection = async () => {
  try {
    const result = await redisClient.ping();
    logger.info('Redis connection established successfully.');
    return result === 'PONG';
  } catch (error) {
    logger.error('Unable to connect to Redis:', error);
    return false;
  }
};

module.exports = {
  redisClient,
  checkRedisConnection
};