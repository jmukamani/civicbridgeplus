require('dotenv').config(); // Load environment variables FIRST
const app = require('./src/app');
const { sequelize, checkDatabaseConnection } = require('./src/config/database');
const { redisClient, checkRedisConnection } = require('./src/config/redis');
const mongoose = require('./src/config/mongodb');
const logger = require('./src/utils/logger');

const initializeDatabases = async () => {
  try {
    logger.info('Initializing database connections...');

    // 1. Initialize PostgreSQL
    logger.info('Connecting to PostgreSQL...');
    await checkDatabaseConnection();
    logger.info('✅ PostgreSQL connected and models synchronized');

    // 2. Initialize MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect();
    logger.info('✅ MongoDB connected');

    // 3. Initialize Redis
    logger.info('Connecting to Redis...');
    await checkRedisConnection();
    logger.info('✅ Redis connected');

    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    return false;
  }
};

// Server startup sequence
const startServer = async () => {
  try {
    logger.info('Starting server initialization...');

    // 1. Initialize all databases first
    const dbsInitialized = await initializeDatabases();
    if (!dbsInitialized) {
      throw new Error('Database initialization failed - cannot start server');
    }

    // 2. Start Express server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📅 ${new Date().toISOString()}`);
      logger.info(`📚 API docs available at http://localhost:${PORT}/api-docs`);
    });

    // 3. Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('💀 Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (server) => {
  try {
    logger.info('🛑 Received shutdown signal - closing connections...');
    
    // Close server first to stop new connections
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('✅ Express server closed');
    }

    // Close database connections in parallel
    await Promise.allSettled([
      sequelize.close().then(() => logger.info('✅ PostgreSQL connection closed')),
      mongoose.disconnect().then(() => logger.info('✅ MongoDB connection closed')),
      redisClient.quit().then(() => logger.info('✅ Redis connection closed'))
    ]);

    logger.info('👋 All connections closed. Goodbye!');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle various shutdown signals
let server;
startServer().then((s) => { server = s; });

process.on('SIGTERM', () => shutdown(server)); // For Kubernetes/container orchestration
process.on('SIGINT', () => shutdown(server));  // For Ctrl+C in terminal

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  shutdown(server);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  shutdown(server);
});