const crypto = require('crypto');

/**
 * Generate a random string of specified length
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Format date to human-readable string
 */
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date);
  const pad = (num) => (num < 10 ? '0' + num : num);

  return format
    .replace(/YYYY/g, d.getFullYear())
    .replace(/MM/g, pad(d.getMonth() + 1))
    .replace(/DD/g, pad(d.getDate()))
    .replace(/HH/g, pad(d.getHours()))
    .replace(/mm/g, pad(d.getMinutes()))
    .replace(/ss/g, pad(d.getSeconds()));
};

/**
 * Convert object keys to camelCase
 */
const toCamelCase = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }

  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
      });
      newObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return newObj;
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Validate Kenyan phone number
 */
const validateKenyanPhone = (phone) => {
  const regex = /^(\+?254|0)[17]\d{8}$/;
  return regex.test(phone);
};

module.exports = {
  generateRandomString,
  formatDate,
  toCamelCase,
  sanitizeInput,
  validateKenyanPhone
};