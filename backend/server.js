require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/config/database');
const redisClient = require('./src/config/redis');
const mongoose = require('./src/config/mongodb');
const logger = require('./src/utils/logger');

// Add uncaught exception handlers
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

let server;

(async () => {
  try {
    console.log('Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');

    console.log('Connecting to MongoDB...');
    await mongoose.connect();
    console.log('✅ MongoDB connected');

    console.log('Connecting to Redis...');
    const { redisClient, checkRedisConnection } = require('./src/config/redis');
    await checkRedisConnection();
    console.log('✅ Redis connected');

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      logger.info(`API docs available at http://localhost:${PORT}/api-docs`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        sequelize.close();
        redisClient.quit();
        mongoose.disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('💥 FAILED TO START:', error.message);
    logger.error('Startup error:', error.stack);
    process.exit(1);
  }
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  if (server) {
    server.close(() => {
    process.exit(1);
  });
} else {
  process.exit(1);
}
});

module.exports = server;