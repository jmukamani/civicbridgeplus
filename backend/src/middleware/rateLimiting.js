const rateLimit = require('express-rate-limit');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');
const { APIError, TooManyRequestsError } = require('../utils/response');

/**
 * Redis store for rate limiting
 */
const redisStore = {
  incr: async (key, cb) => {
    try {
      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, 60); // Set expiry only on first increment
      }
      cb(null, current);
    } catch (err) {
      cb(err);
    }
  }
};

/**
 * Global rate limiter
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  store: redisStore,
  handler: (req, res, next) => {
    next(new TooManyRequestsError('Too many requests, please try again later'));
  }
});

/**
 * Auth rate limiter (more strict for auth endpoints)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // allow more requests for dev
  store: redisStore,
  handler: (req, res, next) => {
    next(new TooManyRequestsError('Too many auth requests, please try again later'));
  }
});

/**
 * Dynamic rate limiter based on user role
 */
const roleBasedLimiter = (req, res, next) => {
  let limiter;
  
  switch (req.user?.role) {
    case 'admin':
      limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        store: redisStore
      });
      break;
    case 'representative':
      limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        store: redisStore
      });
      break;
    default:
      limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        store: redisStore
      });
  }

  limiter(req, res, next);
};

module.exports = {
  globalLimiter,
  authLimiter,
  roleBasedLimiter
};