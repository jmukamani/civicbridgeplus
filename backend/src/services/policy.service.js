const { Policy, County, User } = require('../models/postgres');
const { deleteFile } = require('../config/storage');
const logger = require('../utils/logger');

/**
 * Get all policies with filtering and pagination
 */
const getAllPolicies = async (filters, pagination) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const { county_id, category, search } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (county_id) where.county_id = county_id;
    if (category) where.category = category;

    if (search) {
      where[Sequelize.Op.or] = [
        { title: { [Sequelize.Op.iLike]: `%${search}%` } },
        { description: { [Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: policies } = await Policy.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: County,
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          as: 'UploadedBy',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      policies,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting all policies:', error);
    throw error;
  }
};

/**
 * Get policy by ID
 */
const getPolicyById = async (policyId) => {
  try {
    const policy = await Policy.findByPk(policyId, {
      include: [
        {
          model: County,
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          as: 'UploadedBy',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    if (!policy) {
      throw new Error('Policy not found');
    }

    // Increment view count
    policy.view_count += 1;
    await policy.save();

    return policy;
  } catch (error) {
    logger.error('Error getting policy by ID:', error);
    throw error;
  }
};

/**
 * Create new policy
 */
const createPolicy = async (policyData, fileData, userId) => {
  try {
    if (!fileData) {
      throw new Error('No file uploaded');
    }

    const policy = await Policy.create({
      title: policyData.title,
      description: policyData.description,
      category: policyData.category,
      county_id: policyData.county_id,
      document_type: policyData.document_type,
      file_path: fileData.path,
      file_size: fileData.size,
      file_type: fileData.mimetype,
      uploaded_by: userId
    });

    return policy;
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (fileData) {
      deleteFile(fileData.path);
    }
    logger.error('Error creating policy:', error);
    throw error;
  }
};

/**
 * Update policy
 */
const updatePolicy = async (policyId, updateData, fileData, userId) => {
  try {
    const policy = await Policy.findByPk(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Update fields
    const allowedFields = ['title', 'description', 'category', 'county_id', 'document_type'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        policy[field] = updateData[field];
      }
    });

    // Handle file update if new file is provided
    if (fileData) {
      // Delete old file
      deleteFile(policy.file_path);

      // Update with new file
      policy.file_path = fileData.path;
      policy.file_size = fileData.size;
      policy.file_type = fileData.mimetype;
    }

    await policy.save();

    return policy;
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (fileData) {
      deleteFile(fileData.path);
    }
    logger.error('Error updating policy:', error);
    throw error;
  }
};

/**
 * Delete policy
 */
const deletePolicy = async (policyId) => {
  try {
    const policy = await Policy.findByPk(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Delete the file
    deleteFile(policy.file_path);

    // Delete the policy record
    await policy.destroy();

    return true;
  } catch (error) {
    logger.error('Error deleting policy:', error);
    throw error;
  }
};

/**
 * Search policies with full-text search
 */
const searchPolicies = async (query, filters) => {
  try {
    const { county_id, category } = filters;
    const limit = 10;

    if (!query) {
      throw new Error('Search query is required');
    }

    const where = {};
    if (county_id) where.county_id = county_id;
    if (category) where.category = category;

    // Using Sequelize's full-text search capabilities
    const policies = await Policy.findAll({
      where: {
        ...where,
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.iLike]: `%${query}%` } },
          { description: { [Sequelize.Op.iLike]: `%${query}%` } },
          Sequelize.literal(`to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', '${query.split(' ').join(' & ')}')`)
        ]
      },
      limit,
      include: [
        {
          model: County,
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [[Sequelize.literal(`ts_rank(to_tsvector('english', title || ' ' || description), to_tsquery('english', '${query.split(' ').join(' & ')}')`), 'DESC']]
    });

    return policies;
  } catch (error) {
    logger.error('Error searching policies:', error);
    throw error;
  }
};

/**
 * Get policies by county
 */
const getPoliciesByCounty = async (countyId, pagination) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const { count, rows: policies } = await Policy.findAndCountAll({
      where: { county_id: countyId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: County,
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      policies,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting policies by county:', error);
    throw error;
  }
};

/**
 * Prepare policy file for download
 */
const preparePolicyDownload = async (policyId) => {
  try {
    const policy = await Policy.findByPk(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Increment download count
    policy.download_count += 1;
    await policy.save();

    return {
      filePath: policy.file_path,
      fileName: `${policy.title}${path.extname(policy.file_path)}`
    };
  } catch (error) {
    logger.error('Error preparing policy download:', error);
    throw error;
  }
};

module.exports = {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  searchPolicies,
  getPoliciesByCounty,
  preparePolicyDownload
};