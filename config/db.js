const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotel_booking_db';
    
    // Attempt standard connection first
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 2000,
        autoIndex: true
      });
      console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (connErr) {
      if (process.env.NODE_ENV === 'production') {
        throw connErr;
      }
      
      console.warn(`[MongoDB] Direct connection to ${mongoURI} failed (${connErr.message}).`);
      console.log(`[MongoDB] Initializing embedded MongoDB Memory Server for local development / viva demo...`);

      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();

      const conn = await mongoose.connect(memUri, {
        autoIndex: true
      });
      console.log(`[MongoDB] Connected to In-Memory MongoDB instance at: ${memUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[MongoDB] Fatal Connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
