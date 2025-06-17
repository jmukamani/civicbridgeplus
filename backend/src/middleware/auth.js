const jwt = require('jsonwebtoken');
const { response } = require('../utils/response');
const { JWT_SECRET } = require('../utils/constants');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return response(res, 401, 'Access token required');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return response(res, 403, 'Invalid or expired token');
    }
    
    req.user = {
      id: user.id,
      role: user.role,
      countyId: user.countyId
    };
    
    next();
  });
};