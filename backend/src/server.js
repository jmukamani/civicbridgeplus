const express = require('express');
const cors = require('cors');
const { pgPool, connectMongoDB } = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// Database connections
(async () => {
  try {
    await pgPool.query('SELECT NOW()');
    console.log('PostgreSQL connected');
    await connectMongoDB();
    await connectRedis();
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/policies', require('./src/routes/policy.routes'));

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;