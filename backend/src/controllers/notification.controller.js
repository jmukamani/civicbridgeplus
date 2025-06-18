const { Notification } = require('../models/mongodb/notification.model');
const { User } = require('../models/postgres/user.model');
const logger = require('../utils/logger');
const { APIError, NotFoundError } = require('../utils/response');

/**
 * Get user's notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, read } = req.query;
    const skip = (page - 1) * limit;

    const query = { user_id: userId };
    if (read !== undefined) query.read = read === 'true';

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: { read: true, read_at: new Date() } },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { email, sms, push } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update notification preferences
    user.notification_preferences = {
      email: email !== undefined ? email : user.notification_preferences?.email || true,
      sms: sms !== undefined ? sms : user.notification_preferences?.sms || false,
      push: push !== undefined ? push : user.notification_preferences?.push || true
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: user.notification_preferences
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const count = await Notification.countDocuments({
      user_id: userId,
      read: false
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send bulk notifications (admin only)
 */
const sendBulkNotifications = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { title, message, user_ids, notification_type } = req.body;

    if (role !== 'admin') {
      throw new ForbiddenError('Only admins can send bulk notifications');
    }

    // Validate user_ids
    const users = await User.findAll({
      where: { id: user_ids },
      attributes: ['id']
    });

    if (users.length !== user_ids.length) {
      throw new BadRequestError('One or more user IDs are invalid');
    }

    // Create notifications
    const notifications = user_ids.map(user_id => ({
      user_id,
      type: notification_type || 'announcement',
      title,
      message,
      data: req.body.data || {},
      delivery_status: 'pending'
    }));

    await Notification.insertMany(notifications);

    // TODO: Queue notifications for delivery based on user preferences

    logger.info(`Admin ${userId} sent bulk notification to ${user_ids.length} users`);

    res.status(200).json({
      success: true,
      message: `Notifications created for ${user_ids.length} users`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  updatePreferences,
  getUnreadCount,
  sendBulkNotifications
};