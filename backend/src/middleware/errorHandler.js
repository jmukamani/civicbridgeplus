const logger = require('../utils/logger');
const { APIError } = require('../utils/response');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.stack);

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new APIError('Invalid token', 401);
  } else if (err.name === 'TokenExpiredError') {
    err = new APIError('Token expired', 401);
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    err = new APIError('Validation failed', 400, errors);
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
    err = new APIError('Duplicate entry', 400, errors);
  }

  // Default to 500 if status not set
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send error response
  res.status(status).json({
    success: false,
    message,
    errors: err.errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;