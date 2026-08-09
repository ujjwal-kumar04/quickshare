const express = require('express');
const router = express.Router();

const { getProfile, updateProfile, updatePassword } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', updatePassword);

module.exports = router;
