const Message = require('../models/postgres/message.model');
const Policy = require('../models/postgres/policy.model');
const User = require('../models/postgres/user.model');
const logger = require('../utils/logger');

/**
 * Get representative dashboard metrics
 */
const getMetrics = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Get pending messages count
    const pendingMessages = await Message.count({
      where: {
        recipient_id: userId,
        is_read: false
      }
    });

    // Get published policies count
    const publishedPolicies = await Policy.count({
      where: {
        uploaded_by: userId,
        status: 'published'
      }
    });

    // Get constituents count (users in the same constituency)
    const user = await User.findByPk(userId);
    let constituents = 0;
    
    if (user && user.constituency_id) {
      constituents = await User.count({
        where: {
          constituency_id: user.constituency_id,
          role: 'citizen'
        }
      });
    }

    // Calculate average response time (placeholder for now)
    const avgResponseTime = 24; // hours

    res.status(200).json({
      success: true,
      data: {
        pendingMessages,
        publishedPolicies,
        constituents,
        avgResponseTime
      }
    });
  } catch (error) {
    logger.error('Error getting representative metrics:', error);
    // Return default values instead of throwing error
    res.status(200).json({
      success: true,
      data: {
        pendingMessages: 0,
        publishedPolicies: 0,
        constituents: 0,
        avgResponseTime: 24
      }
    });
  }
};

/**
 * Get representative activity data
 */
const getActivity = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Get message activity for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityData = [];

    // Generate activity data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      // Count incoming messages
      const incoming = await Message.count({
        where: {
          recipient_id: userId,
          created_at: {
            [require('sequelize').Op.between]: [dayStart, dayEnd]
          }
        }
      });

      // Count outgoing messages
      const outgoing = await Message.count({
        where: {
          sender_id: userId,
          created_at: {
            [require('sequelize').Op.between]: [dayStart, dayEnd]
          }
        }
      });

      activityData.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        incoming,
        outgoing
      });
    }

    res.status(200).json({
      success: true,
      data: activityData
    });
  } catch (error) {
    logger.error('Error getting representative activity:', error);
    next(error);
  }
};

module.exports = {
  getMetrics,
  getActivity
}; 