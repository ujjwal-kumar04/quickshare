const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const generateToken = require('../utils/generateToken');
const { success, failure } = require('../utils/apiResponse');
const { sendPasswordResetEmail } = require('../services/email/emailService');

/**
 * POST /api/auth/register
 * New accounts always start as status "pending" - they cannot log in
 * until an admin approves them from the admin dashboard.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return failure(res, { message: 'An account with this email already exists', statusCode: 409 });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      status: 'pending',
      role: 'user',
    });

    return success(res, {
      statusCode: 201,
      message: 'Registration successful. Your account is awaiting admin approval before you can log in.',
      data: { id: user._id, name: user.name, email: user.email, status: user.status },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return failure(res, { message: 'Invalid email or password', statusCode: 401 });
    }

    if (user.isBlocked) {
      return failure(res, { message: 'Your account has been blocked by an administrator', statusCode: 403 });
    }

    if (user.status === 'pending') {
      return failure(res, { message: 'Your account is awaiting admin approval', statusCode: 403 });
    }

    if (user.status === 'rejected') {
      return failure(res, { message: 'Your account access request was rejected', statusCode: 403 });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(res, {
      message: 'Login successful',
      data: { token, user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.clearCookie('token');
  return success(res, { message: 'Logged out successfully' });
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => success(res, { message: 'Current user', data: { user: req.user.toSafeObject() } });

/**
 * POST /api/auth/forgot-password
 * Always responds with a generic success message to avoid leaking
 * whether an email exists in the system.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const genericResponse = () =>
      success(res, { message: 'If an account exists for that email, a reset link has been sent.' });

    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });
    if (!user) return genericResponse();

    const token = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.create({
      user: user._id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return genericResponse();
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const resetRecord = await PasswordResetToken.findOne({ token });
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return failure(res, { message: 'Reset link is invalid or has expired', statusCode: 400 });
    }

    const user = await User.findById(resetRecord.user);
    if (!user) return failure(res, { message: 'User no longer exists', statusCode: 404 });

    user.password = password;
    await user.save();
    await PasswordResetToken.deleteMany({ user: user._id });

    return success(res, { message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/change-password (authenticated)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return failure(res, { message: 'A valid current and new password (8+ chars) are required', statusCode: 422 });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return failure(res, { message: 'Current password is incorrect', statusCode: 401 });
    }

    user.password = newPassword;
    await user.save();

    return success(res, { message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword, changePassword };
