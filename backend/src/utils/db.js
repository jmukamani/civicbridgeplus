const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, MONGO_URI } = require('../config');

// PostgreSQL connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  logging: false,
});

// MongoDB connection
const mongoConnection = mongoose.createConnection(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connectDB = async () => {
  try {
    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  mongoConnection,
  connectDB,
};