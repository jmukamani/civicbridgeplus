const Message = require('../models/postgres/message.model');
const User = require('../models/postgres/user.model');
const logger = require('../utils/logger');
const { APIError, NotFoundError, ForbiddenError } = require('../utils/response');

/**
 * Get user's messages with pagination
 */
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, status, type } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      [Sequelize.Op.or]: [
        { sender_id: userId },
        { recipient_id: userId }
      ]
    };

    if (status) where.status = status;
    if (type) where.message_type = type;

    const { count, rows: messages } = await Message.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'first_name', 'last_name', 'role']
        },
        {
          model: User,
          as: 'Recipient',
          attributes: ['id', 'first_name', 'last_name', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: messages,
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
 * Get message thread
 */
const getThread = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { threadId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Sequelize.Op.or]: [
          { thread_id: threadId },
          { id: threadId }
        ]
      },
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'first_name', 'last_name', 'role']
        },
        {
          model: User,
          as: 'Recipient',
          attributes: ['id', 'first_name', 'last_name', 'role']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    // Check if user is part of the thread
    const userInThread = messages.some(
      msg => msg.sender_id === userId || msg.recipient_id === userId
    );

    if (!userInThread) {
      throw new ForbiddenError('You are not authorized to view this thread');
    }

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send new message
 */
const sendMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { recipient_id, subject, content, parent_message_id, message_type, priority } = req.body;

    // Check if recipient exists
    const recipient = await User.findByPk(recipient_id);
    if (!recipient) {
      throw new NotFoundError('Recipient not found');
    }

    // Determine thread ID
    let threadId;
    if (parent_message_id) {
      const parentMessage = await Message.findByPk(parent_message_id);
      if (!parentMessage) {
        throw new NotFoundError('Parent message not found');
      }
      threadId = parentMessage.thread_id || parent_message_id;
    }

    const message = await Message.create({
      sender_id: userId,
      recipient_id,
      subject,
      content,
      thread_id: threadId,
      parent_message_id,
      message_type,
      priority
    });

    // TODO: Send notification to recipient

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check if user is the recipient
    if (message.recipient_id !== userId) {
      throw new ForbiddenError('You are not authorized to mark this message as read');
    }

    // Update read status if not already read
    if (!message.read_at) {
      message.read_at = new Date();
      message.status = 'read';
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's conversations
 */
const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get distinct threads where user is involved
    const { count, rows: conversations } = await Message.findAndCountAll({
      where: {
        [Sequelize.Op.or]: [
          { sender_id: userId },
          { recipient_id: userId }
        ]
      },
      attributes: [
        'thread_id',
        [Sequelize.fn('MAX', Sequelize.col('created_at')), 'last_message_at'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'message_count']
      ],
      group: ['thread_id'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[Sequelize.literal('last_message_at'), 'DESC']]
    });

    // Get details for each conversation
    const conversationDetails = await Promise.all(
      conversations.map(async conv => {
        const threadId = conv.thread_id;
        const lastMessage = await Message.findOne({
          where: {
            [Sequelize.Op.or]: [
              { thread_id: threadId },
              { id: threadId }
            ]
          },
          include: [
            {
              model: User,
              as: 'Sender',
              attributes: ['id', 'first_name', 'last_name']
            },
            {
              model: User,
              as: 'Recipient',
              attributes: ['id', 'first_name', 'last_name']
            }
          ],
          order: [['created_at', 'DESC']]
        });

        return {
          thread_id: threadId,
          last_message: lastMessage,
          unread_count: await Message.count({
            where: {
              [Sequelize.Op.or]: [
                { thread_id: threadId },
                { id: threadId }
              ],
              recipient_id: userId,
              read_at: null
            }
          })
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversationDetails,
      pagination: {
        total: count.length, // Sequelize returns count as an array for grouped queries
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count.length / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete message
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check if user is the sender or recipient
    if (message.sender_id !== userId && message.recipient_id !== userId) {
      throw new ForbiddenError('You are not authorized to delete this message');
    }

    // Soft delete by setting status
    message.status = 'archived';
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search messages
 */
const searchMessages = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      throw new BadRequestError('Search query is required');
    }

    const messages = await Message.findAll({
      where: {
        [Sequelize.Op.or]: [
          { sender_id: userId },
          { recipient_id: userId }
        ],
        [Sequelize.Op.or]: [
          { subject: { [Sequelize.Op.iLike]: `%${query}%` } },
          { content: { [Sequelize.Op.iLike]: `%${query}%` } },
          Sequelize.literal(`to_tsvector('english', subject || ' ' || content) @@ to_tsquery('english', '${query.split(' ').join(' & ')}')`)
        ]
      },
      limit,
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: User,
          as: 'Recipient',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [[Sequelize.literal(`ts_rank(to_tsvector('english', subject || ' ' || content), to_tsquery('english', '${query.split(' ').join(' & ')}')`), 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get message statistics
 */
const getMessageStats = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    let stats;
    if (role === 'representative') {
      // Representative stats
      stats = await Message.findAll({
        where: { recipient_id: userId },
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_messages'],
          [Sequelize.fn('SUM', Sequelize.case({
            when: { read_at: { [Sequelize.Op.not]: null } },
            then: 1,
            else: 0
          })), 'read_messages'],
          [Sequelize.fn('AVG', Sequelize.fn('EXTRACT', Sequelize.literal('EPOCH FROM (read_at - created_at)/3600'))), 'avg_response_hours'],
          [Sequelize.fn('MAX', Sequelize.fn('EXTRACT', Sequelize.literal('EPOCH FROM (read_at - created_at)/3600'))), 'max_response_hours'],
          [Sequelize.fn('MIN', Sequelize.fn('EXTRACT', Sequelize.literal('EPOCH FROM (read_at - created_at)/3600'))), 'min_response_hours']
        ]
      });
    } else {
      // Citizen stats
      stats = await Message.findAll({
        where: { sender_id: userId },
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_messages'],
          [Sequelize.fn('SUM', Sequelize.case({
            when: { read_at: { [Sequelize.Op.not]: null } },
            then: 1,
            else: 0
          })), 'read_messages'],
          [Sequelize.fn('AVG', Sequelize.fn('EXTRACT', Sequelize.literal('EPOCH FROM (read_at - created_at)/3600'))), 'avg_response_hours']
        ]
      });
    }

    res.status(200).json({
      success: true,
      data: stats[0] // Sequelize returns an array
    });
  } catch (error) {
    next(error);
  }
};

// Get unread message count for the logged-in user
const getUnreadCount = async (req, res, next) => {
  try {
    // Placeholder: return 0 for now
    res.status(200).json({ success: true, unreadCount: 0 });
  } catch (error) {
    next(error);
  }
};

// Get recent messages for the logged-in user
const getRecentMessages = async (req, res, next) => {
  try {
    // Placeholder: return empty array for now
    res.status(200).json({ success: true, messages: [] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  getThread,
  sendMessage,
  markAsRead,
  getConversations,
  deleteMessage,
  searchMessages,
  getMessageStats,
  getUnreadCount,
  getRecentMessages,
};