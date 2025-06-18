const { Policy, Message } = require('../models/postgres');
const logger = require('../utils/logger');

/**
 * Full-text search across policies and messages
 */
const fullTextSearch = async (query, userId, filters) => {
  try {
    const { limit = 10, type } = filters;

    if (!query) {
      throw new Error('Search query is required');
    }

    const searchQuery = query.split(' ').join(' & ');

    let results = [];
    
    // Search policies if type is not specified or is 'policies'
    if (!type || type === 'policies') {
      const policies = await Policy.findAll({
        where: {
          [Sequelize.Op.or]: [
            { title: { [Sequelize.Op.iLike]: `%${query}%` } },
            { description: { [Sequelize.Op.iLike]: `%${query}%` } },
            Sequelize.literal(`to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', '${searchQuery}')`)
          ]
        },
        limit: parseInt(limit),
        include: [
          {
            model: County,
            attributes: ['id', 'name', 'code']
          }
        ],
        order: [[Sequelize.literal(`ts_rank(to_tsvector('english', title || ' ' || description), to_tsquery('english', '${searchQuery}'))`), 'DESC']]
      });

      results = results.concat(policies.map(policy => ({
        type: 'policy',
        id: policy.id,
        title: policy.title,
        description: policy.description,
        score: policy.getDataValue('rank') // Assuming rank is returned by ts_rank
      })));
    }

    // Search messages if type is not specified or is 'messages'
    if (!type || type === 'messages') {
      const messages = await Message.findAll({
        where: {
          [Sequelize.Op.or]: [
            { sender_id: userId },
            { recipient_id: userId }
          ],
          [Sequelize.Op.or]: [
            { subject: { [Sequelize.Op.iLike]: `%${query}%` } },
            { content: { [Sequelize.Op.iLike]: `%${query}%` } },
            Sequelize.literal(`to_tsvector('english', subject || ' ' || content) @@ to_tsquery('english', '${searchQuery}')`)
          ]
        },
        limit: parseInt(limit),
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
        order: [[Sequelize.literal(`ts_rank(to_tsvector('english', subject || ' ' || content), to_tsquery('english', '${searchQuery}'))`), 'DESC']]
      });

      results = results.concat(messages.map(message => ({
        type: 'message',
        id: message.id,
        title: message.subject,
        description: message.content.substring(0, 100) + '...',
        score: message.getDataValue('rank') // Assuming rank is returned by ts_rank
      })));
    }

    // Sort all results by score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  } catch (error) {
    logger.error('Error performing full-text search:', error);
    throw error;
  }
};

/**
 * Index content for search
 */
const indexContent = async (contentType, contentId) => {
  try {
    // TODO: Implement search indexing
    // This would depend on the search engine being used (Elasticsearch, Algolia, etc.)
    logger.info(`Indexing ${contentType} with ID ${contentId}`);
    return true;
  } catch (error) {
    logger.error('Error indexing content:', error);
    throw error;
  }
};

/**
 * Remove content from search index
 */
const removeFromIndex = async (contentType, contentId) => {
  try {
    // TODO: Implement search index removal
    logger.info(`Removing ${contentType} with ID ${contentId} from index`);
    return true;
  } catch (error) {
    logger.error('Error removing content from index:', error);
    throw error;
  }
};

/**
 * Get search analytics
 */
const getSearchAnalytics = async (period) => {
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

    // TODO: Implement actual search analytics
    // This is a placeholder implementation
    return {
      totalSearches: 0,
      popularQueries: [],
      noResultsQueries: []
    };
  } catch (error) {
    logger.error('Error getting search analytics:', error);
    throw error;
  }
};

module.exports = {
  fullTextSearch,
  indexContent,
  removeFromIndex,
  getSearchAnalytics
};