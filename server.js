require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Auto-seed demo data if database is empty (e.g. In-Memory fallback mode)
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Seeding initial demo data...');
      const { seedData } = require('./seed/seeder');
      await seedData(false);
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] API Base URL: http://localhost:${PORT}/api`);
    });

    // Graceful Shutdown
    const shutdown = (signal) => {
      console.log(`[Server] ${signal} signal received. Closing HTTP server.`);
      server.close(() => {
        console.log('[Server] HTTP server closed. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error(`[Server] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
