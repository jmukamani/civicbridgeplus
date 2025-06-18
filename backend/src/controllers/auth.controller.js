const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/postgres/user.model');
const { redisClient } = require('../config/redis');
const { sendEmail } = require('../config/email');
const logger = require('../utils/logger');
const { generateToken, generateRefreshToken } = require('../services/auth.service');
const { APIError, BadRequestError } = require('../utils/response');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone_number, county_id, constituency_id } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    // Create new user
    const user = await User.create({
      email,
      password_hash: password,
      first_name,
      last_name,
      phone_number,
      county_id,
      constituency_id,
      role: 'citizen'
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Store token in Redis for verification
    await redisClient.set(`verify:${user.id}`, verificationToken, 'EX', 86400);

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `<p>Please click the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a></p>`
    });

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification instructions.',
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user and return JWT token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    // Check if account is active
    if (!user.is_active) {
      throw new BadRequestError('Account is inactive. Please contact support.');
    }

    // Verify password
    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis
    await redisClient.set(`refresh:${user.id}`, refreshToken, 'EX', 604800); // 7 days

    // Update last login
    user.last_login = new Date();
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user by invalidating tokens
 */
const logout = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Remove refresh token from Redis
    await redisClient.del(`refresh:${userId}`);

    logger.info(`User logged out: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate password reset process
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestError('If an account exists with this email, a reset link has been sent');
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store token in Redis
    await redisClient.set(`reset:${user.id}`, resetToken, 'EX', 3600);

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Please click the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
    });

    logger.info(`Password reset initiated for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset user password with valid token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if token exists in Redis
    const storedToken = await redisClient.get(`reset:${userId}`);
    if (!storedToken || storedToken !== token) {
      throw new BadRequestError('Invalid or expired token');
    }

    // Find user and update password
    const user = await User.findByPk(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    user.password_hash = newPassword;
    await user.save();

    // Remove token from Redis
    await redisClient.del(`reset:${userId}`);

    logger.info(`Password reset for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify token validity
 */
const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if token exists in Redis (for specific token types)
    const storedToken = await redisClient.get(`verify:${userId}`);
    if (storedToken && storedToken !== token) {
      throw new BadRequestError('Invalid token');
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        userId,
        expiresIn: decoded.exp
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.id;

    // Check if refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh:${userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new BadRequestError('Invalid refresh token');
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Generate new access token
    const newToken = generateToken(user);

    logger.info(`Token refreshed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyToken,
  refreshToken
};