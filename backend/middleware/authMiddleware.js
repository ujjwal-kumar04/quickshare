const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { failure } = require('../utils/apiResponse');

/**
 * Verifies the JWT (Bearer header or "token" cookie), loads the user,
 * and rejects blocked / not-yet-approved accounts.
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return failure(res, { message: 'Not authorized, no token provided', statusCode: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return failure(res, { message: 'Not authorized, invalid or expired token', statusCode: 401 });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return failure(res, { message: 'Not authorized, user no longer exists', statusCode: 401 });
    }

    if (user.isBlocked) {
      return failure(res, { message: 'Your account has been blocked by an administrator', statusCode: 403 });
    }

    if (user.status !== 'approved') {
      return failure(res, {
        message:
          user.status === 'pending'
            ? 'Your account is awaiting admin approval'
            : 'Your account access has been rejected by an administrator',
        statusCode: 403,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return failure(res, { message: 'Not authorized', statusCode: 401 });
  }
};

module.exports = authMiddleware;
