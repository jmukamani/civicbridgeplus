const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/postgres/user.model');
const redisClient = require('../config/redis');
const { generateTokens, verifyRefreshToken } = require('../services/auth.service');

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { email, phone, password, role, county, constituency } = req.body;
    
    // Validate input
    if (!email || !phone || !password || !role || !county || !constituency) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      phone,
      hashed_password: hashedPassword,
      role,
      county,
      constituency
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in Redis with 7 days expiration
    await redisClient.set(user.id.toString(), refreshToken, 'EX', 604800);

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in Redis with 7 days expiration
    await redisClient.set(user.id.toString(), refreshToken, 'EX', 604800);

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc Refresh access token
 * @route POST /api/auth/refresh
 * @access Public (requires refresh token)
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const { userId, newAccessToken, newRefreshToken } = await verifyRefreshToken(refreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete refresh token from Redis
    await redisClient.del(userId.toString());

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser
};