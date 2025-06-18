const { User } = require('../models/postgres/user.model');
const { Representative } = require('../models/postgres/representative.model');
const { Policy } = require('../models/postgres/policy.model');
const { Message } = require('../models/postgres/message.model');
const { County } = require('../models/postgres/county.model');
const { Constituency } = require('../models/postgres/constituency.model');
const { Analytics } = require('../models/mongodb/analytics.model');
const { Notification } = require('../models/mongodb/notification.model');
const logger = require('../utils/logger');
const { APIError, NotFoundError, ForbiddenError } = require('../utils/response');

/**
 * User management
 */
const getUserManagement = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, county_id, constituency_id, is_active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (county_id) where.county_id = county_id;
    if (constituency_id) where.constituency_id = constituency_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: County,
          attributes: ['name']
        },
        {
          model: Constituency,
          attributes: ['name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system statistics
 */
const getSystemStats = async (req, res, next) => {
  try {
    const [userCount, representativeCount, policyCount, messageCount] = await Promise.all([
      User.count(),
      Representative.count(),
      Policy.count(),
      Message.count()
    ]);

    // Get recent activities
    const recentActivities = await Analytics.find()
      .sort({ timestamp: -1 })
      .limit(5);

    // Get system health
    const systemHealth = {
      database: await sequelize.authenticate() ? 'OK' : 'Error',
      redis: await redisClient.ping() === 'PONG' ? 'OK' : 'Error',
      mongodb: mongoose.connection.readyState === 1 ? 'OK' : 'Error',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };

    res.status(200).json({
      success: true,
      data: {
        userCount,
        representativeCount,
        policyCount,
        messageCount,
        recentActivities,
        systemHealth
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage representatives
 */
const manageRepresentatives = async (req, res, next) => {
  try {
    const { action, representativeId } = req.params;
    const { notes } = req.body;

    const representative = await Representative.findByPk(representativeId, {
      include: [User]
    });

    if (!representative) {
      throw new NotFoundError('Representative not found');
    }

    switch (action) {
      case 'verify':
        representative.verification_status = 'verified';
        representative.User.role = 'representative';
        break;
      case 'reject':
        representative.verification_status = 'rejected';
        break;
      case 'suspend':
        representative.User.is_active = false;
        break;
      case 'activate':
        representative.User.is_active = true;
        break;
      default:
        throw new BadRequestError('Invalid action');
    }

    if (notes) representative.verification_notes = notes;

    await Promise.all([
      representative.save(),
      representative.User.save()
    ]);

    // Send notification to representative
    await Notification.create({
      user_id: representative.user_id,
      type: 'system',
      title: 'Representative Status Update',
      message: `Your representative status has been ${action}ed`,
      data: {
        action,
        notes
      }
    });

    res.status(200).json({
      success: true,
      message: `Representative ${action}ed successfully`,
      data: representative
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Content moderation
 */
const moderateContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { action, reason } = req.body;

    let content;
    switch (type) {
      case 'policy':
        content = await Policy.findByPk(id);
        if (!content) throw new NotFoundError('Policy not found');
        break;
      case 'message':
        content = await Message.findByPk(id);
        if (!content) throw new NotFoundError('Message not found');
        break;
      default:
        throw new BadRequestError('Invalid content type');
    }

    // Apply moderation action
    switch (action) {
      case 'approve':
        content.is_active = true;
        content.moderation_status = 'approved';
        break;
      case 'reject':
        content.is_active = false;
        content.moderation_status = 'rejected';
        break;
      case 'remove':
        content.is_active = false;
        content.moderation_status = 'removed';
        if (type === 'policy') {
          // Delete the file
          deleteFile(content.file_path);
        }
        break;
      default:
        throw new BadRequestError('Invalid moderation action');
    }

    content.moderation_notes = reason;
    await content.save();

    // Send notification to content owner if applicable
    if (type === 'policy' || type === 'message') {
      const userId = type === 'policy' ? content.uploaded_by : content.sender_id;
      await Notification.create({
        user_id: userId,
        type: 'system',
        title: 'Content Moderation',
        message: `Your ${type} has been ${action}d by moderators`,
        data: {
          type,
          id,
          action,
          reason
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Content ${action}d successfully`,
      data: content
    });
  } catch (error) {
    next(error);
  }
};

/**
 * System health check
 */
const systemHealth = async (req, res, next) => {
  try {
    const health = {
      database: await sequelize.authenticate() ? 'OK' : 'Error',
      redis: await redisClient.ping() === 'PONG' ? 'OK' : 'Error',
      mongodb: mongoose.connection.readyState === 1 ? 'OK' : 'Error',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      loadAvg: process.getLoadAvg ? process.getLoadAvg() : null,
      diskUsage: await getDiskUsage()
    };

    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get disk usage
async function getDiskUsage() {
  try {
    const checkDiskSpace = require('check-disk-space').default;
    const diskSpace = await checkDiskSpace('/');
    return {
      free: diskSpace.free,
      size: diskSpace.size,
      used: diskSpace.size - diskSpace.free
    };
  } catch (err) {
    logger.error('Error checking disk space:', err);
    return null;
  }
}

/**
 * Generate administrative reports
 */
const generateReports = async (req, res, next) => {
  try {
    const { type, format = 'json', start_date, end_date } = req.query;

    let report;
    switch (type) {
      case 'user_registration':
        report = await generateUserRegistrationReport(start_date, end_date);
        break;
      case 'policy_uploads':
        report = await generatePolicyUploadsReport(start_date, end_date);
        break;
      case 'message_traffic':
        report = await generateMessageTrafficReport(start_date, end_date);
        break;
      case 'system_usage':
        report = await generateSystemUsageReport(start_date, end_date);
        break;
      default:
        throw new BadRequestError('Invalid report type');
    }

    if (format === 'csv') {
      // TODO: Convert report to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_report.csv`);
      // Send CSV data
    } else {
      res.status(200).json({
        success: true,
        data: report
      });
    }
  } catch (error) {
    next(error);
  }
};

// Helper functions for report generation
async function generateUserRegistrationReport(start_date, end_date) {
  const where = {};
  if (start_date && end_date) where.created_at = { [Sequelize.Op.between]: [start_date, end_date] };

  const users = await User.findAll({
    where,
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      [Sequelize.fn('SUM', Sequelize.case({
        when: { role: 'citizen' },
        then: 1,
        else: 0
      })), 'citizens'],
      [Sequelize.fn('SUM', Sequelize.case({
        when: { role: 'representative' },
        then: 1,
        else: 0
      })), 'representatives']
    ],
    group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
    order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']]
  });

  return users;
}

async function generatePolicyUploadsReport(start_date, end_date) {
  const where = {};
  if (start_date && end_date) where.upload_date = { [Sequelize.Op.between]: [start_date, end_date] };

  const policies = await Policy.findAll({
    where,
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('upload_date')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      'category',
      'document_type'
    ],
    include: [
      {
        model: County,
        attributes: ['name']
      },
      {
        model: User,
        as: 'UploadedBy',
        attributes: ['first_name', 'last_name', 'role']
      }
    ],
    group: [
      Sequelize.fn('DATE', Sequelize.col('upload_date')),
      'category',
      'document_type',
      'County.name',
      'UploadedBy.first_name',
      'UploadedBy.last_name',
      'UploadedBy.role'
    ],
    order: [[Sequelize.fn('DATE', Sequelize.col('upload_date')), 'ASC']]
  });

  return policies;
}

async function generateMessageTrafficReport(start_date, end_date) {
  const where = {};
  if (start_date && end_date) where.created_at = { [Sequelize.Op.between]: [start_date, end_date] };

  const messages = await Message.findAll({
    where,
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      'message_type',
      [Sequelize.fn('AVG', Sequelize.fn('EXTRACT', Sequelize.literal('EPOCH FROM (read_at - created_at)/3600'))), 'avg_response_hours']
    ],
    include: [
      {
        model: User,
        as: 'Sender',
        attributes: ['role']
      },
      {
        model: User,
        as: 'Recipient',
        attributes: ['role']
      }
    ],
    group: [
      Sequelize.fn('DATE', Sequelize.col('created_at')),
      'message_type',
      'Sender.role',
      'Recipient.role'
    ],
    order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']]
  });

  return messages;
}

async function generateSystemUsageReport(start_date, end_date) {
  const where = {};
  if (start_date && end_date) where.timestamp = { $gte: new Date(start_date), $lte: new Date(end_date) };

  const report = await Analytics.aggregate([
    {
      $match: where
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$user_id" },
        actions: { $push: "$action_type" }
      }
    },
    {
      $project: {
        date: "$_id",
        count: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        actions: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);

  return report;
}

module.exports = {
  getUserManagement,
  getSystemStats,
  manageRepresentatives,
  moderateContent,
  systemHealth,
  generateReports
};