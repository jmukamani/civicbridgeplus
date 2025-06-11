const app = require('./app');
const { PORT } = require('./config');
const { connectDB } = require('./utils/db');

// Start server
const start = async () => {
  try {
    // Connect to databases
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();