const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { deleteFile } = require('../config/storage');
const logger = require('../utils/logger');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

/**
 * Upload file
 */
const uploadFile = async (file, destination) => {
  try {
    const filePath = path.join(destination, file.originalname);
    await writeFileAsync(filePath, file.buffer);
    return filePath;
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Download file
 */
const downloadFile = async (filePath) => {
  try {
    const data = await readFileAsync(filePath);
    return {
      data,
      fileName: path.basename(filePath),
      fileType: path.extname(filePath).substring(1)
    };
  } catch (error) {
    logger.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Delete file
 */
const removeFile = async (filePath) => {
  try {
    await unlinkAsync(filePath);
    return true;
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Validate file
 */
const validateFile = (file, allowedTypes, maxSize) => {
  try {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    return true;
  } catch (error) {
    logger.error('Error validating file:', error);
    throw error;
  }
};

/**
 * Generate thumbnail
 */
const generateThumbnail = async (filePath, options) => {
  try {
    // TODO: Implement thumbnail generation using a library like sharp
    // This is a placeholder implementation
    return filePath; // Return same file path for now
  } catch (error) {
    logger.error('Error generating thumbnail:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  removeFile,
  validateFile,
  generateThumbnail
};