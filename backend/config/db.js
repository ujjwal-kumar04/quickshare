const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using MONGODB_URI from environment variables.
 * Exits the process on failure so the app never runs against a broken DB.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  mongoose.connection.on('connected', () => {
    console.log(`[DB] Mongoose connected to ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Mongoose connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Mongoose disconnected.');
  });

  try {
    await mongoose.connect(uri, { autoIndex: true });
    console.log('[DB] MongoDB Atlas connection established successfully.');
  } catch (err) {
    console.error('[DB] Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[DB] Mongoose connection closed due to app termination.');
  process.exit(0);
});

module.exports = connectDB;
