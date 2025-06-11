const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { jwtSecret, jwtExpiration, refreshTokenExpiration } = require('../config');
const redisClient = require('../utils/redis');

const authController = {
  async register(req, res, next) {
    try {
      const { email, phone, password, role, county, constituency } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Create user
      const user = await User.create({
        email,
        phone,
        hashed_password: password, // Will be hashed by model hook
        role,
        county,
        constituency,
      });

      // Generate tokens
      const tokens = await generateTokens(user);

      res.status(201).json({ user: user.toJSON(), ...tokens });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.hashed_password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate tokens
      const tokens = await generateTokens(user);

      res.json({ user: user.toJSON(), ...tokens });
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtSecret);
      
      // Check if token is in Redis
      const storedToken = await redisClient.get(`refreshToken:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Get user
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate new tokens
      const tokens = await generateTokens(user);

      // Delete old refresh token
      await redisClient.del(`refreshToken:${decoded.userId}`);

      res.json(tokens);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const { userId } = req.user;
      
      // Delete refresh token from Redis
      await redisClient.del(`refreshToken:${userId}`);
      
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },
};

async function generateTokens(user) {
  // Create JWT payload
  const payload = {
    userId: user.id,
    role: user.role,
  };

  // Generate access token
  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiration,
  });

  // Generate refresh token
  const refreshToken = jwt.sign(payload, jwtSecret, {
    expiresIn: refreshTokenExpiration,
  });

  // Store refresh token in Redis
  await redisClient.set(
    `refreshToken:${user.id}`,
    refreshToken,
    'EX',
    refreshTokenExpiration
  );

  return { accessToken, refreshToken };
}

module.exports = authController;