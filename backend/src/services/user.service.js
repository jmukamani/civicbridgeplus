const { User, Representative, County, Constituency } = require('../models/postgres');
const logger = require('../utils/logger');
const { sendVerificationEmail } = require('./auth.service');

/**
 * Create a new user
 */
const createUser = async (userData) => {
  try {
    const user = await User.create(userData);

    // Send verification email
    await sendVerificationEmail(user);

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    };
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: County,
          attributes: ['id', 'name', 'code']
        },
        {
          model: Constituency,
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update allowed fields
    const allowedFields = ['first_name', 'last_name', 'phone_number', 'county_id', 'constituency_id'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    await user.save();

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      county_id: user.county_id,
      constituency_id: user.constituency_id
    };
  } catch (error) {
    logger.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get user's representatives
 */
const getUserRepresentatives = async (userId) => {
  try {
    // Get user's constituency
    const user = await User.findByPk(userId, {
      attributes: ['constituency_id']
    });

    if (!user || !user.constituency_id) {
      throw new Error('User constituency not found');
    }

    // Get representatives for the constituency
    const representatives = await Representative.findAll({
      where: { constituency_id: user.constituency_id },
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
        }
      ]
    });

    return representatives;
  } catch (error) {
    logger.error('Error getting user representatives:', error);
    throw error;
  }
};

/**
 * Search users
 */
const searchUsers = async (queryParams) => {
  try {
    const { query, role, county_id, constituency_id } = queryParams;

    const where = {};
    if (role) where.role = role;
    if (county_id) where.county_id = county_id;
    if (constituency_id) where.constituency_id = constituency_id;

    const users = await User.findAll({
      where,
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'county_id', 'constituency_id'],
      include: [
        {
          model: County,
          attributes: ['name']
        },
        {
          model: Constituency,
          attributes: ['name']
        }
      ]
    });

    // Simple search filtering if query is provided
    let results = users;
    if (query) {
      const queryLower = query.toLowerCase();
      results = users.filter(user => 
        user.first_name.toLowerCase().includes(queryLower) ||
        user.last_name.toLowerCase().includes(queryLower) ||
        user.email.toLowerCase().includes(queryLower)
      );
    }

    return results;
  } catch (error) {
    logger.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
const getUserStatistics = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'created_at', 'last_login']
    });

    if (!user) {
      throw new Error('User not found');
    }

    // TODO: Add actual statistics from analytics service
    const stats = {
      messages_sent: 0,
      policies_viewed: 0,
      last_active: user.last_login,
      account_age: Math.floor((new Date() - user.created_at) / (1000 * 60 * 60 * 24)) + ' days'
    };

    return {
      user,
      stats
    };
  } catch (error) {
    logger.error('Error getting user statistics:', error);
    throw error;
  }
};

/**
 * Activate/deactivate user account (admin only)
 */
const toggleUserStatus = async (userId, isActive) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.is_active = isActive;
    await user.save();

    return user;
  } catch (error) {
    logger.error('Error toggling user status:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUserProfile,
  getUserRepresentatives,
  searchUsers,
  getUserStatistics,
  toggleUserStatus
};