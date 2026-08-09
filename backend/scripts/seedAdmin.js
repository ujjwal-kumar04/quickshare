/**
 * QuickShare - Admin Seeder
 *
 * Creates or updates the default admin account
 * using credentials from the .env file.
 *
 * Run:
 * npm run seed:admin
 */

require('dotenv').config();

const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');

// Google DNS servers
dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
]);

const seedAdmin = async () => {
  try {
    console.log('\n========================================');
    console.log('       QuickShare Admin Seeder');
    console.log('========================================\n');

    // -----------------------------------------
    // 1. Check environment variables
    // -----------------------------------------

    const {
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      MONGODB_URI,
    } = process.env;

    if (!MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is not defined in the .env file.'
      );
    }

    if (!ADMIN_EMAIL) {
      throw new Error(
        'ADMIN_EMAIL is not defined in the .env file.'
      );
    }

    if (!ADMIN_PASSWORD) {
      throw new Error(
        'ADMIN_PASSWORD is not defined in the .env file.'
      );
    }

    console.log('[Seed] Environment variables loaded.');
    console.log(`[Seed] Admin email: ${ADMIN_EMAIL}`);

    // -----------------------------------------
    // 2. Connect to MongoDB Atlas
    // -----------------------------------------

    console.log('[Seed] Connecting to MongoDB Atlas...');

    await connectDB();

    console.log('[Seed] MongoDB connection successful.');

    // -----------------------------------------
    // 3. Prepare email
    // -----------------------------------------

    const email = ADMIN_EMAIL
      .toLowerCase()
      .trim();

    // -----------------------------------------
    // 4. Find existing user
    // -----------------------------------------

    const existingUser = await User.findOne({
      email,
    }).select('+password');

    // -----------------------------------------
    // 5. Update existing admin
    // -----------------------------------------

    if (existingUser) {
      console.log(
        `[Seed] User already exists: ${existingUser.email}`
      );

      existingUser.name =
        ADMIN_NAME || existingUser.name;

      existingUser.password = ADMIN_PASSWORD;

      existingUser.role = 'admin';

      if ('status' in existingUser) {
        existingUser.status = 'approved';
      }

      if ('isBlocked' in existingUser) {
        existingUser.isBlocked = false;
      }

      await existingUser.save();

      console.log(
        '\n✅ Existing admin account updated successfully.'
      );

      console.log(
        `📧 Email: ${existingUser.email}`
      );

      console.log(
        '🔐 Password: Updated from .env'
      );
    }

    // -----------------------------------------
    // 6. Create new admin
    // -----------------------------------------

    else {
      const admin = await User.create({
        name: ADMIN_NAME || 'Super Admin',
        email,
        password: ADMIN_PASSWORD,
        role: 'admin',
        status: 'approved',
        isBlocked: false,
      });

      console.log(
        '\n✅ Admin account created successfully.'
      );

      console.log(
        `📧 Email: ${admin.email}`
      );

      console.log(
        '🔐 Password: Taken from .env'
      );
    }

    console.log('\n========================================');
    console.log('       Admin Seeding Completed');
    console.log('========================================\n');

  } catch (error) {
    console.error(
      '\n❌ Admin seeding failed.'
    );

    console.error(
      'Error:',
      error.message
    );

    // -----------------------------------------
    // Validation error
    // -----------------------------------------

    if (error.name === 'ValidationError') {
      console.error(
        '\nValidation details:'
      );

      Object.values(error.errors).forEach((err) => {
        console.error(
          `- ${err.path}: ${err.message}`
        );
      });
    }

    // -----------------------------------------
    // Duplicate key error
    // -----------------------------------------

    if (error.code === 11000) {
      console.error(
        '\nDuplicate email detected.'
      );

      console.error(
        'Check your User model indexes.'
      );
    }

    process.exitCode = 1;

  } finally {
    // -----------------------------------------
    // 7. Close MongoDB connection
    // -----------------------------------------

    try {
      if (
        mongoose.connection.readyState !== 0
      ) {
        await mongoose.connection.close();

        console.log(
          '[Seed] MongoDB connection closed.'
        );
      }
    } catch (closeError) {
      console.error(
        '[Seed] Error while closing MongoDB:',
        closeError.message
      );
    }
  }
};

// -----------------------------------------
// Run Seeder
// -----------------------------------------

seedAdmin();