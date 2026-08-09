require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const dns = require("dns");

const PORT = process.env.PORT || 5000;

const start = async () => {
  dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
  ]);

  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] QuickShare API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('[Server] Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

start();
