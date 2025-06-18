const { sendEmail } = require('../config/email');
const { User } = require('../models/postgres');
const logger = require('../utils/logger');

/**
 * Send verification email
 */
const sendVerificationEmail = async (user) => {
  try {
    const verificationToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

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

    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user) => {
  try {
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${user.first_name},</p>
        <p>You have requested to reset your password. Please click the following link to reset it:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    });

    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to CivicBridgePulse',
      html: `
        <p>Hello ${user.first_name},</p>
        <p>Welcome to CivicBridgePulse! We're excited to have you on board.</p>
        <p>You can now connect with your elected representatives and access important policy documents.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Thank you,</p>
        <p>The CivicBridgePulse Team</p>
      `
    });

    return true;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send account status email
 */
const sendAccountStatusEmail = async (user, status) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Your Account Has Been ${status}`,
      html: `
        <p>Hello ${user.first_name},</p>
        <p>Your CivicBridgePulse account has been ${status} by an administrator.</p>
        ${status === 'suspended' ? 
          '<p>If you believe this is an error, please contact support.</p>' : 
          '<p>You can now log in and use the platform as usual.</p>'
        }
        <p>Thank you,</p>
        <p>The CivicBridgePulse Team</p>
      `
    });

    return true;
  } catch (error) {
    logger.error('Error sending account status email:', error);
    throw error;
  }
};

/**
 * Send representative verification email
 */
const sendRepresentativeVerificationEmail = async (user, status) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Representative Verification ${status}`,
      html: `
        <p>Hello ${user.first_name},</p>
        <p>Your representative verification request has been ${status}.</p>
        ${status === 'rejected' ? 
          '<p>Please check your profile for more details and contact support if you have any questions.</p>' : 
          '<p>You can now access representative features on the platform.</p>'
        }
        <p>Thank you,</p>
        <p>The CivicBridgePulse Team</p>
      `
    });

    return true;
  } catch (error) {
    logger.error('Error sending representative verification email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAccountStatusEmail,
  sendRepresentativeVerificationEmail
};