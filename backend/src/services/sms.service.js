const twilio = require('twilio');
const logger = require('../utils/logger');
const { User } = require('../models/postgres');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send SMS message
 */
const sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_ENABLED) {
      logger.info(`SMS not sent (Twilio disabled): ${to} - ${message}`);
      return true;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    logger.info(`SMS sent to ${to}: ${result.sid}`);
    return true;
  } catch (error) {
    logger.error('Error sending SMS:', error);
    throw error;
  }
};

/**
 * Send password reset SMS
 */
const sendPasswordResetSMS = async (user, resetToken) => {
  try {
    const message = `Your CivicBridgePulse password reset code is: ${resetToken}. It expires in 1 hour.`;
    return await sendSMS(user.phone_number, message);
  } catch (error) {
    logger.error('Error sending password reset SMS:', error);
    throw error;
  }
};

/**
 * Send verification SMS
 */
const sendVerificationSMS = async (user, verificationCode) => {
  try {
    const message = `Your CivicBridgePulse verification code is: ${verificationCode}`;
    return await sendSMS(user.phone_number, message);
  } catch (error) {
    logger.error('Error sending verification SMS:', error);
    throw error;
  }
};

/**
 * Send notification SMS
 */
const sendNotificationSMS = async (user, notification) => {
  try {
    const message = `${notification.title}: ${notification.message}`;
    return await sendSMS(user.phone_number, message);
  } catch (error) {
    logger.error('Error sending notification SMS:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  sendPasswordResetSMS,
  sendVerificationSMS,
  sendNotificationSMS
};