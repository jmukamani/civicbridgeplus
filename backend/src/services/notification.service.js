const { Notification } = require('../models/mongodb/notification.model');
const { User } = require('../models/postgres');
const { sendEmail } = require('../config/email');
const logger = require('../utils/logger');

/**
 * Get user's notifications
 */
const getNotifications = async (userId, filters) => {
  try {
    const { page = 1, limit = 10, read } = filters;
    const skip = (page - 1) * limit;

    const query = { user_id: userId };
    if (read !== undefined) query.read = read;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query)
    ]);

    return {
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Create notification
 */
const createNotification = async (notificationData) => {
  try {
    const { user_id, type, title, message, data } = notificationData;

    const notification = new Notification({
      user_id,
      type,
      title,
      message,
      data,
      delivery_status: 'pending'
    });

    await notification.save();

    // Send notification based on user preferences
    await sendNotification(notification);

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { $set: { read: true, read_at: new Date() } },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Update user notification preferences
 */
const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update notification preferences
    user.notification_preferences = {
      email: preferences.email !== undefined ? preferences.email : user.notification_preferences?.email || true,
      sms: preferences.sms !== undefined ? preferences.sms : user.notification_preferences?.sms || false,
      push: preferences.push !== undefined ? preferences.push : user.notification_preferences?.push || true
    };

    await user.save();

    return user.notification_preferences;
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
const getUnreadNotificationCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      user_id: userId,
      read: false
    });

    return count;
  } catch (error) {
    logger.error('Error getting unread notification count:', error);
    throw error;
  }
};

/**
 * Send bulk notifications
 */
const sendBulkNotifications = async (notificationData, senderId) => {
  try {
    const { title, message, user_ids, notification_type } = notificationData;

    // Validate user_ids
    const users = await User.findAll({
      where: { id: user_ids },
      attributes: ['id']
    });

    if (users.length !== user_ids.length) {
      throw new Error('One or more user IDs are invalid');
    }

    // Create notifications
    const notifications = user_ids.map(user_id => ({
      user_id,
      type: notification_type || 'announcement',
      title,
      message,
      data: notificationData.data || {},
      delivery_status: 'pending'
    }));

    await Notification.insertMany(notifications);

    // TODO: Queue notifications for delivery based on user preferences

    return user_ids.length;
  } catch (error) {
    logger.error('Error sending bulk notifications:', error);
    throw error;
  }
};

/**
 * Send notification based on user preferences
 */
const sendNotification = async (notification) => {
  try {
    const user = await User.findByPk(notification.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    const preferences = user.notification_preferences || {
      email: true,
      sms: false,
      push: true
    };

    // Send email notification if enabled
    if (preferences.email) {
      await sendEmailNotification(notification, user);
    }

    // Send SMS notification if enabled
    if (preferences.sms && user.phone_number) {
      await sendSMSNotification(notification, user);
    }

    // Send push notification if enabled
    if (preferences.push) {
      await sendPushNotification(notification, user);
    }

    // Update delivery status
    notification.delivery_status = 'sent';
    notification.sent_at = new Date();
    await notification.save();

    return true;
  } catch (error) {
    logger.error('Error sending notification:', error);
    
    // Update delivery status with error
    notification.delivery_status = 'failed';
    notification.error = error.message;
    notification.retry_count = (notification.retry_count || 0) + 1;
    await notification.save();

    throw error;
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (notification, user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: notification.title,
      html: `
        <p>Hello ${user.first_name},</p>
        <p>${notification.message}</p>
        ${notification.data ? `<p>Details: ${JSON.stringify(notification.data)}</p>` : ''}
        <p>Thank you,</p>
        <p>CivicBridgePulse Team</p>
      `
    });

    return true;
  } catch (error) {
    logger.error('Error sending email notification:', error);
    throw error;
  }
};

/**
 * Send SMS notification
 */
const sendSMSNotification = async (notification, user) => {
  try {
    // TODO: Implement SMS service integration
    // This is a placeholder implementation
    logger.info(`SMS sent to ${user.phone_number}: ${notification.message}`);
    return true;
  } catch (error) {
    logger.error('Error sending SMS notification:', error);
    throw error;
  }
};

/**
 * Send push notification
 */
const sendPushNotification = async (notification, user) => {
  try {
    // TODO: Implement push notification service integration
    // This is a placeholder implementation
    logger.info(`Push notification sent to user ${user.id}`);
    return true;
  } catch (error) {
    logger.error('Error sending push notification:', error);
    throw error;
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  updateNotificationPreferences,
  getUnreadNotificationCount,
  sendBulkNotifications,
  sendNotification
};