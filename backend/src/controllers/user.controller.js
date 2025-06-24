const User = require('../models/postgres/user.model');
const { Representative, County, Constituency } = require('../models/postgres/user.model');
const logger = require('../utils/logger');
const { APIError, NotFoundError, ForbiddenError } = require('../utils/response');

/**
 * Get user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;

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
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { first_name, last_name, phone_number, county_id, constituency_id } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update fields
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone_number) user.phone_number = phone_number;
    if (county_id) user.county_id = county_id;
    if (constituency_id) user.constituency_id = constituency_id;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        county_id: user.county_id,
        constituency_id: user.constituency_id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's representatives
 */
const getRepresentatives = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Get user's constituency
    const user = await User.findByPk(userId, {
      attributes: ['constituency_id']
    });

    if (!user || !user.constituency_id) {
      throw new NotFoundError('User constituency not found');
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

    res.status(200).json({
      success: true,
      data: representatives
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify representative (admin only)
 */
const verifyRepresentative = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { representativeId } = req.params;
    const { status, notes } = req.body;

    // Check if user is admin
    if (role !== 'admin') {
      throw new ForbiddenError('Only admins can verify representatives');
    }

    const representative = await Representative.findByPk(representativeId, {
      include: [User]
    });

    if (!representative) {
      throw new NotFoundError('Representative not found');
    }

    // Update verification status
    representative.verification_status = status;
    if (notes) representative.verification_notes = notes;
    await representative.save();

    // If verified, update user role
    if (status === 'verified') {
      const user = await User.findByPk(representative.user_id);
      user.role = 'representative';
      await user.save();
    }

    logger.info(`Representative ${representativeId} verification status updated to ${status} by admin ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Representative verification updated',
      data: representative
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search users
 */
const searchUsers = async (req, res, next) => {
  try {
    const { query, role, county_id, constituency_id } = req.query;
    const { role: userRole } = req.user;

    // Only admins can search all users
    const where = {};
    if (userRole !== 'admin') {
      where.role = 'representative'; // Non-admins can only search representatives
    }

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

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    // Only admins can view other users' stats
    const targetUserId = role === 'admin' && req.params.userId ? req.params.userId : userId;

    const user = await User.findByPk(targetUserId, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'created_at', 'last_login']
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // TODO: Add actual statistics from analytics service
    const stats = {
      messages_sent: 0,
      policies_viewed: 0,
      last_active: user.last_login,
      account_age: Math.floor((new Date() - user.created_at) / (1000 * 60 * 60 * 24)) + ' days'
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getRepresentatives,
  verifyRepresentative,
  searchUsers,
  getUserStats
};