const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');
const { APIError, UnauthorizedError } = require('../utils/response');

/**
 * Verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is blacklisted (logout)
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token is no longer valid');
    }

    // Attach user to request
    req.user = {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    logger.error('Error verifying token:', error);
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

/**
 * Check if user has required role
 */
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (req.user.role !== requiredRole) {
        throw new ForbiddenError(`Requires ${requiredRole} role`);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Refresh token middleware
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.id;

    // Check if refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh:${userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate new access token
    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    req.newToken = newToken;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  checkRole,
  refreshToken
};