const { Message, User } = require('../models/postgres');
const logger = require('../utils/logger');

/**
 * Get user's messages with pagination
 */
const getMessages = async (userId, filters) => {
  try {
    const { page = 1, limit = 10, status, type } = filters;
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

    return {
      messages,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Get message thread
 */
const getMessageThread = async (threadId, userId) => {
  try {
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
      throw new Error('Unauthorized to view this thread');
    }

    return messages;
  } catch (error) {
    logger.error('Error getting message thread:', error);
    throw error;
  }
};

/**
 * Send new message
 */
const sendMessage = async (messageData, senderId) => {
  try {
    const { recipient_id, subject, content, parent_message_id, message_type, priority } = messageData;

    // Check if recipient exists
    const recipient = await User.findByPk(recipient_id);
    if (!recipient) {
      throw new Error('Recipient not found');
    }

    // Determine thread ID
    let threadId;
    if (parent_message_id) {
      const parentMessage = await Message.findByPk(parent_message_id);
      if (!parentMessage) {
        throw new Error('Parent message not found');
      }
      threadId = parentMessage.thread_id || parent_message_id;
    }

    const message = await Message.create({
      sender_id: senderId,
      recipient_id,
      subject,
      content,
      thread_id: threadId,
      parent_message_id,
      message_type,
      priority
    });

    // TODO: Send notification to recipient

    return message;
  } catch (error) {
    logger.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark message as read
 */
const markMessageAsRead = async (messageId, userId) => {
  try {
    const message = await Message.findByPk(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user is the recipient
    if (message.recipient_id !== userId) {
      throw new Error('Unauthorized to mark this message as read');
    }

    // Update read status if not already read
    if (!message.read_at) {
      message.read_at = new Date();
      message.status = 'read';
      await message.save();
    }

    return message;
  } catch (error) {
    logger.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Get user's conversations
 */
const getConversations = async (userId, pagination) => {
  try {
    const { page = 1, limit = 10 } = pagination;
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

    return {
      conversations: conversationDetails,
      pagination: {
        total: count.length, // Sequelize returns count as an array for grouped queries
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count.length / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting conversations:', error);
    throw error;
  }
};

/**
 * Delete message (soft delete)
 */
const deleteMessage = async (messageId, userId) => {
  try {
    const message = await Message.findByPk(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user is the sender or recipient
    if (message.sender_id !== userId && message.recipient_id !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    // Soft delete by setting status
    message.status = 'archived';
    await message.save();

    return true;
  } catch (error) {
    logger.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Search messages
 */
const searchMessages = async (query, userId) => {
  try {
    const limit = 10;

    if (!query) {
      throw new Error('Search query is required');
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

    return messages;
  } catch (error) {
    logger.error('Error searching messages:', error);
    throw error;
  }
};

/**
 * Get message statistics
 */
const getMessageStatistics = async (userId, role) => {
  try {
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

    return stats[0]; // Sequelize returns an array
  } catch (error) {
    logger.error('Error getting message statistics:', error);
    throw error;
  }
};

module.exports = {
  getMessages,
  getMessageThread,
  sendMessage,
  markMessageAsRead,
  getConversations,
  deleteMessage,
  searchMessages,
  getMessageStatistics
};