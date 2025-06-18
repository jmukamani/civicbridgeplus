const Joi = require('joi');
const { APIError, BadRequestError } = require('../utils/response');

/**
 * Joi validation middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req[property], {
        abortEarly: false,
        allowUnknown: false
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/['"]/g, '')
        }));
        throw new BadRequestError('Validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone_number: Joi.string().pattern(/^\+?[0-9]{10,15}$/),
    county_id: Joi.string().uuid(),
    constituency_id: Joi.string().uuid()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  policy: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    category: Joi.string().required(),
    county_id: Joi.string().uuid().required(),
    document_type: Joi.string().valid('policy', 'regulation', 'report', 'other').required()
  }),
  message: Joi.object({
    recipient_id: Joi.string().uuid().required(),
    subject: Joi.string().required(),
    content: Joi.string().required(),
    parent_message_id: Joi.string().uuid(),
    message_type: Joi.string().valid('general', 'complaint', 'suggestion', 'request'),
    priority: Joi.string().valid('low', 'medium', 'high')
  })
};

module.exports = {
  validate,
  schemas
};