/**
 * Consistent API response helpers.
 */
const success = (res, { message = 'Success', data = {}, statusCode = 200 } = {}) =>
  res.status(statusCode).json({ success: true, message, data });

const failure = (res, { message = 'Something went wrong', statusCode = 400, errors = null } = {}) =>
  res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });

module.exports = { success, failure };
