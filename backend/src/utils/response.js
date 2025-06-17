const response = (res, statusCode, message, data = {}) => {
    res.status(statusCode).json({
      status: statusCode < 400 ? 'success' : 'error',
      message,
      ...data
    });
  };
  
  module.exports = { response };