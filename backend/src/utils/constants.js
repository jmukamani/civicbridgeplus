module.exports = {
    ROLES: {
      CITIZEN: 'citizen',
      REPRESENTATIVE: 'representative',
      ADMIN: 'admin'
    },
    POLICY_TYPES: {
      POLICY: 'policy',
      REGULATION: 'regulation',
      REPORT: 'report',
      OTHER: 'other'
    },
    MESSAGE_TYPES: {
      GENERAL: 'general',
      COMPLAINT: 'complaint',
      SUGGESTION: 'suggestion',
      REQUEST: 'request'
    },
    NOTIFICATION_TYPES: {
      SYSTEM: 'system',
      MESSAGE: 'message',
      POLICY_UPDATE: 'policy_update',
      ANNOUNCEMENT: 'announcement',
      REMINDER: 'reminder'
    },
    STATUS_CODES: {
      SUCCESS: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      TOO_MANY_REQUESTS: 429,
      INTERNAL_SERVER_ERROR: 500
    },
    ERROR_MESSAGES: {
      INVALID_CREDENTIALS: 'Invalid email or password',
      UNAUTHORIZED: 'Unauthorized access',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Resource not found',
      DUPLICATE_ENTRY: 'Duplicate entry',
    VALIDATION_ERROR: 'Validation failed',
    INTERNAL_ERROR: 'Internal server error'
  }
};