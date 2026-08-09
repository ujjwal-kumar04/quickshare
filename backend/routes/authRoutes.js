const express = require('express');
const router = express.Router();

const {
  register, login, logout, getMe, forgotPassword, resetPassword, changePassword,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/change-password', authMiddleware, changePassword);
router.get('/me', authMiddleware, getMe);

module.exports = router;
