const { Analytics } = require('../models/mongodb/analytics.model');
const { Message } = require('../models/postgres/message.model');
const { Policy } = require('../models/postgres/policy.model')
const logger = require('../utils/logger');
const { APIError } = require('../utils/response');

/**
 * Get role-specific dashboard data
 */
const getDashboard = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    let dashboardData;
    if (role === 'admin') {
      // Admin dashboard
      const [userCount, policyCount, messageCount] = await Promise.all([
        User.count(),
        Policy.count(),
        Message.count()
      ]);

      dashboardData = {
        userCount,
        policyCount,
        messageCount,
        recentActivities: await Analytics.find().sort({ timestamp: -1 }).limit(5)
      };
    } else if (role === 'representative') {
      // Representative dashboard
      const [messageStats, policyStats] = await Promise.all([
        Message.findAll({
          where: { recipient_id: userId },
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
            [Sequelize.fn('SUM', Sequelize.case({
              when: { read_at: { [Sequelize.Op.not]: null } },
              then: 1,
              else: 0
            })), 'read'],
            [Sequelize.fn('AVG', Sequelize.fn('EXTRACT', Sequelize.literal('EPOCH FROM (read_at - created_at)/3600'))), 'avg_response_hours']
          ]
        }),
        Policy.count({
          where: { uploaded_by: userId }
        })
      ]);

      dashboardData = {
        messages: {
          total: messageStats[0].dataValues.total,
          read: messageStats[0].dataValues.read,
          avg_response_hours: messageStats[0].dataValues.avg_response_hours
        },
        policies: policyStats,
        recentMessages: await Message.findAll({
          where: { recipient_id: userId },
          order: [['created_at', 'DESC']],
          limit: 5,
          include: [
            {
              model: User,
              as: 'Sender',
              attributes: ['first_name', 'last_name']
            }
          ]
        })
      };
    } else {
      // Citizen dashboard
      const [messageStats, policyStats] = await Promise.all([
        Message.findAll({
          where: { sender_id: userId },
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
            [Sequelize.fn('SUM', Sequelize.case({
              when: { read_at: { [Sequelize.Op.not]: null } },
              then: 1,
              else: 0
            })), 'read']
          ]
        }),
        Policy.count({
          where: { county_id: req.user.county_id }
        })
      ]);

      dashboardData = {
        messages: {
          total: messageStats[0].dataValues.total,
          read: messageStats[0].dataValues.read
        },
        policies: policyStats,
        recentPolicies: await Policy.findAll({
          where: { county_id: req.user.county_id },
          order: [['created_at', 'DESC']],
          limit: 5
        })
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user engagement metrics
 */
const getEngagementMetrics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
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

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get representative responsiveness metrics
 */
const getResponseMetrics = async (req, res, next) => {
  try {
    const { representativeId } = req.params;
    const { period = '7d' } = req.query;
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

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track user action
 */
const trackAction = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { action_type, resource_id, metadata } = req.body;

    const analytics = new Analytics({
      user_id: userId,
      action_type,
      resource_id,
      metadata,
      session_id: req.sessionID,
      ip_address: req.ip,
      geographic_data: req.geo,
      device_info: {
        type: req.device.type,
        os: req.useragent.os,
        browser: req.useragent.browser,
        user_agent: req.useragent.source
      }
    });

    await analytics.save();

    res.status(200).json({
      success: true,
      message: 'Action tracked successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate various reports
 */
const getReports = async (req, res, next) => {
  try {
    const { type, county_id, start_date, end_date } = req.query;

    let report;
    switch (type) {
      case 'user_activity':
        report = await generateUserActivityReport(county_id, start_date, end_date);
        break;
      case 'policy_views':
        report = await generatePolicyViewsReport(county_id, start_date, end_date);
        break;
      case 'message_volume':
        report = await generateMessageVolumeReport(county_id, start_date, end_date);
        break;
      default:
        throw new BadRequestError('Invalid report type');
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for report generation
async function generateUserActivityReport(county_id, start_date, end_date) {
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
}

async function generatePolicyViewsReport(county_id, start_date, end_date) {
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
}

async function generateMessageVolumeReport(county_id, start_date, end_date) {
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
}

/**
 * Export data
 */
const exportData = async (req, res, next) => {
  try {
    const { type, format = 'json' } = req.query;

    if (!['users', 'policies', 'messages', 'analytics'].includes(type)) {
      throw new BadRequestError('Invalid data type for export');
    }

    let data;
    switch (type) {
      case 'users':
        data = await User.findAll({
          attributes: { exclude: ['password_hash'] }
        });
        break;
      case 'policies':
        data = await Policy.findAll();
        break;
      case 'messages':
        data = await Message.findAll();
        break;
      case 'analytics':
        data = await Analytics.find();
        break;
    }

    if (format === 'csv') {
      // TODO: Convert data to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
      // Send CSV data
    } else {
      res.status(200).json({
        success: true,
        data
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getEngagementMetrics,
  getResponseMetrics,
  trackAction,
  getReports,
  exportData
};