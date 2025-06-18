const { APIError, ForbiddenError } = require('../utils/response');

/**
 * Role-Based Access Control middleware
 */
const rbac = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Resource ownership check middleware
 */
const checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findByPk(req.params[paramName]);
      if (!resource) {
        throw new NotFoundError('Resource not found');
      }

      // Admins can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Check ownership based on common field names
      const ownerField = resource.user_id ? 'user_id' : 
                       resource.created_by ? 'created_by' : 
                       resource.uploaded_by ? 'uploaded_by' : 
                       resource.sender_id ? 'sender_id' : null;

      if (!ownerField) {
        throw new Error('Ownership field not found');
      }

      if (resource[ownerField] !== req.user.userId) {
        throw new ForbiddenError('You do not own this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  rbac,
  checkOwnership
};