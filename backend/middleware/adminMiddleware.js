const { failure } = require('../utils/apiResponse');

/**
 * Must run AFTER authMiddleware. Only allows role === "admin".
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return failure(res, { message: 'Admin access required', statusCode: 403 });
  }
  next();
};

module.exports = adminMiddleware;
