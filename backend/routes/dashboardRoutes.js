const express = require('express');
const router = express.Router();

const { getStats, getActivity, getAnalytics } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/stats', getStats);
router.get('/activity', getActivity);
router.get('/analytics', getAnalytics);

module.exports = router;
