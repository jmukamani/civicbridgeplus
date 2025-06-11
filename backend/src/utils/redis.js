const { createClient } = require('redis');
const { REDIS_URL } = require('../config');

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.connect();

module.exports = redisClient;