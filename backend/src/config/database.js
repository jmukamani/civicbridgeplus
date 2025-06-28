const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    pool: {
      max: parseInt(process.env.POSTGRES_POOL_MAX) || 5,
      min: parseInt(process.env.POSTGRES_POOL_MIN) || 0,
      idle: parseInt(process.env.POSTGRES_POOL_IDLE) || 10000,
      acquire: parseInt(process.env.POSTGRES_POOL_ACQUIRE) || 30000
    },
    logging: process.env.NODE_ENV === 'development' ? msg => logger.debug(msg) : false,
    dialectOptions: {
      ssl: process.env.POSTGRES_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  checkDatabaseConnection
};