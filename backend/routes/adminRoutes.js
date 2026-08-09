const express = require('express');
const router = express.Router();

const {
  getAdminDashboard, getUsers, getUserById, approveUser, rejectUser, blockUser, unblockUser, deleteUser,
  getAllShares, getShareById, disableShareAdmin, deleteShareAdmin, getAdminAnalytics,
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', getAdminDashboard);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

router.get('/shares', getAllShares);
router.get('/shares/:id', getShareById);
router.patch('/shares/:id/disable', disableShareAdmin);
router.delete('/shares/:id', deleteShareAdmin);

router.get('/analytics', getAdminAnalytics);

module.exports = router;
