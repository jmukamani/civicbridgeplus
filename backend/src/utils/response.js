class APIResponse {
    constructor(success, message, data = null, pagination = null) {
      this.success = success;
      this.message = message;
      this.data = data;
      if (pagination) this.pagination = pagination;
    }
  
    static success(message, data, pagination) {
      return new APIResponse(true, message, data, pagination);
    }
  
    static error(message, errors = []) {
      return new APIResponse(false, message, null, null, errors);
    }
  }
  
  class APIError extends Error {
    constructor(message, statusCode, errors = []) {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class BadRequestError extends APIError {
    constructor(message = 'Bad Request', errors = []) {
      super(message, 400, errors);
    }
  }
  
  class UnauthorizedError extends APIError {
    constructor(message = 'Unauthorized', errors = []) {
      super(message, 401, errors);
    }
  }
  
  class ForbiddenError extends APIError {
    constructor(message = 'Forbidden', errors = []) {
      super(message, 403, errors);
    }
  }
  
  class NotFoundError extends APIError {
    constructor(message = 'Not Found', errors = []) {
      super(message, 404, errors);
    }
  }
  
  class ConflictError extends APIError {
    constructor(message = 'Conflict', errors = []) {
      super(message, 409, errors);
    }
  }
  
  class TooManyRequestsError extends APIError {
    constructor(message = 'Too Many Requests', errors = []) {
      super(message, 429, errors);
    }
  }
  
  class InternalServerError extends APIError {
    constructor(message = 'Internal Server Error', errors = []) {
      super(message, 500, errors);
    }
  }
  
  module.exports = {
    APIResponse,
    APIError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    TooManyRequestsError,
    InternalServerError
  };