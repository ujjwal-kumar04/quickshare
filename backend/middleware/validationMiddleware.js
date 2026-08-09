const { failure } = require('../utils/apiResponse');
const { isValidEmail, isStrongEnoughPassword } = require('../utils/validators');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || !name.trim()) errors.push('Name is required');
  if (!isValidEmail(email)) errors.push('A valid email is required');
  if (!isStrongEnoughPassword(password)) errors.push('Password must be at least 8 characters');

  if (errors.length) return failure(res, { message: 'Validation failed', statusCode: 422, errors });
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  if (!isValidEmail(email)) errors.push('A valid email is required');
  if (!password) errors.push('Password is required');
  if (errors.length) return failure(res, { message: 'Validation failed', statusCode: 422, errors });
  next();
};

const validateShareCreate = (req, res, next) => {
  const { text, expiry } = req.body;
  const errors = [];

  const hasFiles = req.files && req.files.length > 0;
  if ((!text || !text.trim()) && !hasFiles) {
    errors.push('Provide text content or at least one file');
  }

  const allowedExpiry = ['10m', '1h', '6h', '24h', '7d', 'never'];
  if (expiry && !allowedExpiry.includes(expiry)) {
    errors.push('Invalid expiry option');
  }

  if (errors.length) return failure(res, { message: 'Validation failed', statusCode: 422, errors });
  next();
};

module.exports = { validateRegister, validateLogin, validateShareCreate };
