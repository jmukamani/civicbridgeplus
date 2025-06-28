const Policy = require('../models/postgres/policy.model');
const { County } = require('../models/postgres/county.model');
const User = require('../models/postgres/user.model');
const { upload, deleteFile } = require('../config/storage');
const logger = require('../utils/logger');
const { APIError, NotFoundError, ForbiddenError } = require('../utils/response');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const Sequelize = require('sequelize');

/**
 * Get all policies with filtering and pagination
 */
const getAllPolicies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, county, county_id, category, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    // Accept both county and county_id, ignore if undefined or 'undefined'
    const effectiveCounty = county_id || county;
    if (effectiveCounty && effectiveCounty !== 'undefined') where.county_id = effectiveCounty;
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

    res.status(200).json({
      success: true,
      data: policies,
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
 * Get single policy by ID
 */
const getPolicyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findByPk(id, {
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
      throw new NotFoundError('Policy not found');
    }

    // Increment view count
    policy.view_count += 1;
    await policy.save();

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new policy document
 */
const createPolicy = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { title, description, category, county_id, document_type } = req.body;

    // Only admins and representatives can upload policies
    if (role !== 'admin' && role !== 'representative') {
      throw new ForbiddenError('Only admins and representatives can upload policies');
    }

    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const policy = await Policy.create({
      title,
      description,
      category,
      county_id,
      document_type,
      file_path: req.file.path,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      uploaded_by: userId
    });

    res.status(201).json({
      success: true,
      message: 'Policy uploaded successfully',
      data: policy
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
};

/**
 * Update policy
 */
const updatePolicy = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;
    const { title, description, category, county_id, document_type } = req.body;

    const policy = await Policy.findByPk(id);
    if (!policy) {
      throw new NotFoundError('Policy not found');
    }

    // Only admins and the uploader can update the policy
    if (role !== 'admin' && policy.uploaded_by !== userId) {
      throw new ForbiddenError('You are not authorized to update this policy');
    }

    // Update fields
    if (title) policy.title = title;
    if (description) policy.description = description;
    if (category) policy.category = category;
    if (county_id) policy.county_id = county_id;
    if (document_type) policy.document_type = document_type;

    // Handle file update if new file is provided
    if (req.file) {
      // Delete old file
      deleteFile(policy.file_path);

      // Update with new file
      policy.file_path = req.file.path;
      policy.file_size = req.file.size;
      policy.file_type = req.file.mimetype;
    }

    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      data: policy
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
};

/**
 * Delete policy
 */
const deletePolicy = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;

    const policy = await Policy.findByPk(id);
    if (!policy) {
      throw new NotFoundError('Policy not found');
    }

    // Only admins and the uploader can delete the policy
    if (role !== 'admin' && policy.uploaded_by !== userId) {
      throw new ForbiddenError('You are not authorized to delete this policy');
    }

    // Delete the file
    deleteFile(policy.file_path);

    // Delete the policy record
    await policy.destroy();

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search policies with full-text search
 */
const searchPolicies = async (req, res, next) => {
  try {
    const { query, county_id, category } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      throw new BadRequestError('Search query is required');
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

    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get policies by county
 */
const getPoliciesByCounty = async (req, res, next) => {
  try {
    const { countyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
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

    res.status(200).json({
      success: true,
      data: policies,
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
 * Download policy file
 */
const downloadPolicy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findByPk(id);
    if (!policy) {
      throw new NotFoundError('Policy not found');
    }

    // Check if file exists
    const filePath = path.join(__dirname, '..', '..', policy.file_path);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('File not found');
    }

    // Increment download count
    policy.download_count += 1;
    await policy.save();

    // Send file
    res.download(filePath, `${policy.title}${path.extname(filePath)}`);
  } catch (error) {
    next(error);
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
  downloadPolicy
};