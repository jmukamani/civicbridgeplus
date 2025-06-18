const { Analytics } = require('../models/mongodb/analytics.model');
const { Message, Policy } = require('../models/postgres');
const logger = require('../utils/logger');

/**
 * Track user action
 */
const trackAction = async (actionData) => {
  try {
    const { user_id, action_type, resource_id, metadata, session_id, ip_address, geographic_data, device_info } = actionData;

    const analytics = new Analytics({
      user_id,
      action_type,
      resource_id,
      metadata,
      session_id,
      ip_address,
      geographic_data,
      device_info
    });

    await analytics.save();

    return true;
  } catch (error) {
    logger.error('Error tracking action:', error);
    throw error;
  }
};

/**
 * Get engagement metrics
 */
const getEngagementMetrics = async (period) => {
  try {
    let days;
    
    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 7;
    }

    const date = new Date();
    date.setDate(date.getDate() - days);

    // Get metrics from MongoDB analytics
    const metrics = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: date }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user_id" }
        }
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    return metrics;
  } catch (error) {
    logger.error('Error getting engagement metrics:', error);
    throw error;
  }
};

/**
 * Get representative responsiveness metrics
 */
const getResponseMetrics = async (representativeId, period) => {
  try {
    let days;
    
    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 7;
    }

    const date = new Date();
    date.setDate(date.getDate() - days);

    const metrics = await Message.findAll({
      where: {
        recipient_id: representativeId,
        created_at: { [Sequelize.Op.gte]: date },
        read_at: { [Sequelize.Op.not]: null }
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'message_count'],
        [Sequelize.fn('AVG', Sequelize.fn('EXTRACT', Sequelize.literal('EPOCH FROM (read_at - created_at)/3600'))), 'avg_response_hours']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']]
    });

    return metrics;
  } catch (error) {
    logger.error('Error getting response metrics:', error);
    throw error;
  }
};

/**
 * Generate user activity report
 */
const generateUserActivityReport = async (county_id, start_date, end_date) => {
  try {
    const where = {};
    if (county_id) where.county_id = county_id;
    if (start_date && end_date) where.created_at = { [Sequelize.Op.between]: [start_date, end_date] };

    const users = await User.findAll({
      where,
      attributes: [
        'id',
        'first_name',
        'last_name',
        'email',
        'role',
        'created_at',
        'last_login'
      ],
      include: [
        {
          model: County,
          attributes: ['name']
        }
      ]
    });

    // Get analytics data for each user
    const report = await Promise.all(
      users.map(async user => {
        const activities = await Analytics.count({ user_id: user.id });
        return {
          user,
          activity_count: activities
        };
      })
    );

    return report;
  } catch (error) {
    logger.error('Error generating user activity report:', error);
    throw error;
  }
};

/**
 * Generate policy views report
 */
const generatePolicyViewsReport = async (county_id, start_date, end_date) => {
  try {
    const where = {};
    if (county_id) where.county_id = county_id;
    if (start_date && end_date) where.created_at = { [Sequelize.Op.between]: [start_date, end_date] };

    const policies = await Policy.findAll({
      where,
      attributes: [
        'id',
        'title',
        'view_count',
        'download_count',
        'created_at'
      ],
      include: [
        {
          model: County,
          attributes: ['name']
        },
        {
          model: User,
          as: 'UploadedBy',
          attributes: ['first_name', 'last_name']
        }
      ],
      order: [['view_count', 'DESC']]
    });

    return policies;
  } catch (error) {
    logger.error('Error generating policy views report:', error);
    throw error;
  }
};

/**
 * Generate message volume report
 */
const generateMessageVolumeReport = async (county_id, start_date, end_date) => {
  try {
    const where = {};
    if (start_date && end_date) where.created_at = { [Sequelize.Op.between]: [start_date, end_date] };

    // If county_id is provided, only include messages from users in that county
    if (county_id) {
      where['$Sender.county_id$'] = county_id;
    }

    const messages = await Message.findAll({
      where,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'message_count'],
        [Sequelize.fn('SUM', Sequelize.case({
          when: { read_at: { [Sequelize.Op.not]: null } },
          then: 1,
          else: 0
        })), 'read_count']
      ],
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: []
        }
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']]
    });

    return messages;
  } catch (error) {
    logger.error('Error generating message volume report:', error);
    throw error;
  }
};

/**
 * Export analytics data
 */
const exportAnalyticsData = async (type, format) => {
  try {
    let data;
    switch (type) {
      case 'user_actions':
        data = await Analytics.find().limit(1000);
        break;
      case 'messages':
        data = await Message.findAll({
          limit: 1000,
          include: [
            {
              model: User,
              as: 'Sender',
              attributes: ['first_name', 'last_name']
            },
            {
              model: User,
              as: 'Recipient',
              attributes: ['first_name', 'last_name']
            }
          ]
        });
        break;
      case 'policy_views':
        data = await Policy.findAll({
          limit: 1000,
          include: [
            {
              model: County,
              attributes: ['name']
            }
          ]
        });
        break;
      default:
        throw new Error('Invalid export type');
    }

    if (format === 'csv') {
      // TODO: Convert data to CSV format
      return {
        contentType: 'text/csv',
        data: convertToCSV(data)
      };
    } else {
      return {
        contentType: 'application/json',
        data
      };
    }
  } catch (error) {
    logger.error('Error exporting analytics data:', error);
    throw error;
  }
};

// Helper function to convert data to CSV
function convertToCSV(data) {
  // Implementation depends on data structure
  // This is a simplified example
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0].dataValues);
  let csv = headers.join(',') + '\n';
  
  data.forEach(item => {
    const values = headers.map(header => {
      let value = item[header];
      if (typeof value === 'object') value = JSON.stringify(value);
      return `"${value}"`;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}

module.exports = {
  trackAction,
  getEngagementMetrics,
  getResponseMetrics,
  generateUserActivityReport,
  generatePolicyViewsReport,
  generateMessageVolumeReport,
  exportAnalyticsData
};