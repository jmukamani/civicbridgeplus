const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxpoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10
    });
    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

const disconnect = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connect,
  disconnect,
  connection: mongoose.connection
};