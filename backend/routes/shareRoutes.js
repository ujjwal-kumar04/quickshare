const express = require('express');
const router = express.Router();

const {
  createShare, getShareByKey, getMyShares, getShareDetails, updateShare, disableShare, deleteShare,
} = require('../controllers/shareController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateShareCreate } = require('../middleware/validationMiddleware');
const { receiveLimiter } = require('../middleware/rateLimitMiddleware');

// Order matters: specific routes before the ":shareKey" catch-all.
router.get('/my', authMiddleware, getMyShares);
router.post('/', authMiddleware, upload.array('files'), validateShareCreate, createShare);
router.get('/:shareKey', receiveLimiter, getShareByKey);
router.get('/:id/details', authMiddleware, getShareDetails);
router.put('/:id', authMiddleware, updateShare);
router.delete('/:id', authMiddleware, deleteShare);
router.post('/:id/disable', authMiddleware, disableShare);

module.exports = router;
