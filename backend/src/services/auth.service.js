const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');
const { User } = require('../models/postgres/user.model');
const { sendEmail } = require('../config/email');

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Verify password
 */
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate password reset token
 */
const generatePasswordResetToken = async (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Store token in Redis
  await redisClient.set(`reset:${userId}`, token, 'EX', 3600);

  return token;
};

/**
 * Verify password reset token
 */
const verifyPasswordResetToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if token exists in Redis
    const storedToken = await redisClient.get(`reset:${userId}`);
    if (!storedToken || storedToken !== token) {
      return null;
    }

    return userId;
  } catch (error) {
    logger.error('Error verifying password reset token:', error);
    return null;
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (user) => {
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Store token in Redis
  await redisClient.set(`verify:${user.id}`, token, 'EX', 86400);

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    html: `
      <p>Hello ${user.first_name},</p>
      <p>Please click the following link to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `
  });
};

/**
 * Verify email token
 */
const verifyEmailToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if token exists in Redis
    const storedToken = await redisClient.get(`verify:${userId}`);
    if (!storedToken || storedToken !== token) {
      return false;
    }

    // Update user verification status
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }

    user.is_verified = true;
    await user.save();

    // Remove token from Redis
    await redisClient.del(`verify:${userId}`);

    return true;
  } catch (error) {
    logger.error('Error verifying email token:', error);
    return false;
  }
};

/**
 * Invalidate all sessions for a user
 */
const invalidateSessions = async (userId) => {
  // Remove refresh token from Redis
  await redisClient.del(`refresh:${userId}`);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  sendVerificationEmail,
  verifyEmailToken,
  invalidateSessions
};