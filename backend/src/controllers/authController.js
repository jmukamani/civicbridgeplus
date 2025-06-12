const bcrypt = require('bcryptjs');
const { generateTokens, verifyToken } = require('../utils/jwt');
const { redisClient } = require('../config/database');
const User = require('../models/postgres/User');
const { validateRegistration, validateLogin } = require('../utils/validation');

const register = async (req, res) => {
  try {
    const { error, value } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, phone, password, role, county, constituency } = value;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      phone,
      hashedPassword,
      role: role || 'citizen',
      county,
      constituency,
    });

    // Generate tokens
    const tokens = generateTokens({ userId: user.id, role: user.role });

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh_${user.id}`,
      7 * 24 * 60 * 60, // 7 days
      tokens.refreshToken
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        county: user.county,
        constituency: user.constituency,
      },
      tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { error, value } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashed_password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokens({ userId: user.id, role: user.role });

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh_${user.id}`,
      7 * 24 * 60 * 60, // 7 days
      tokens.refreshToken
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        county: user.county,
        constituency: user.constituency,
      },
      tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await redisClient.get(`refresh_${decoded.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // Generate new tokens
    const tokens = generateTokens({ userId: user.id, role: user.role });

    // Update stored refresh token
    await redisClient.setEx(
      `refresh_${user.id}`,
      7 * 24 * 60 * 60,
      tokens.refreshToken
    );

    res.json({ tokens });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Blacklist the access token
      await redisClient.setEx(`blacklist_${token}`, 15 * 60, 'true'); // 15 minutes
    }

    // Remove refresh token
    await redisClient.del(`refresh_${req.user.id}`);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};