const { response } = require('../utils/response');

module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return response(res, 403, 'Forbidden: insufficient permissions');
    }
    next();
  };
};