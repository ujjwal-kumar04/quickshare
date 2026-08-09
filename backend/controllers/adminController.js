const User = require('../models/User');
const Share = require('../models/Share');
const File = require('../models/File');
const DownloadHistory = require('../models/DownloadHistory');
const ViewHistory = require('../models/ViewHistory');
const { deleteFile } = require('../services/storage/storageService');
const { isValidObjectId } = require('../utils/validators');
const { success, failure } = require('../utils/apiResponse');

/**
 * GET /api/admin/dashboard
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      pendingUsers,
      totalShares,
      activeShares,
      expiredShares,
      totalFiles,
      downloadsAgg,
      viewsAgg,
      storageAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'approved', isBlocked: false }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ status: 'pending' }),
      Share.countDocuments(),
      Share.countDocuments({ isActive: true, $or: [{ expiryTime: null }, { expiryTime: { $gt: new Date() } }] }),
      Share.countDocuments({ expiryTime: { $ne: null, $lte: new Date() } }),
      File.countDocuments(),
      Share.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
      Share.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      File.aggregate([{ $group: { _id: null, total: { $sum: '$fileSize' } } }]),
    ]);

    return success(res, {
      message: 'Admin dashboard stats retrieved',
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        pendingUsers,
        totalShares,
        activeShares,
        expiredShares,
        totalFiles,
        totalDownloads: downloadsAgg[0]?.total || 0,
        totalViews: viewsAgg[0]?.total || 0,
        storageUsedBytes: storageAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/users?search=&status=&role=
 */
const getUsers = async (req, res, next) => {
  try {
    const { search = '', status, role } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query).sort({ createdAt: -1 });
    const shareCounts = await Share.aggregate([{ $group: { _id: '$user', count: { $sum: 1 } } }]);
    const countMap = new Map(shareCounts.map((s) => [String(s._id), s.count]));

    const data = users.map((u) => ({ ...u.toSafeObject(), shareCount: countMap.get(String(u._id)) || 0 }));

    return success(res, { message: 'Users retrieved', data: { users: data } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid user id', statusCode: 400 });

    const user = await User.findById(id);
    if (!user) return failure(res, { message: 'User not found', statusCode: 404 });

    const shares = await Share.find({ user: id }).sort({ createdAt: -1 });

    return success(res, { message: 'User retrieved', data: { user: user.toSafeObject(), shares } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id/approve
 * Grants a pending user access to the platform.
 */
const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid user id', statusCode: 400 });

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'approved', approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    );
    if (!user) return failure(res, { message: 'User not found', statusCode: 404 });

    return success(res, { message: 'User approved successfully', data: { user: user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id/reject
 */
const rejectUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid user id', statusCode: 400 });

    const user = await User.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!user) return failure(res, { message: 'User not found', statusCode: 404 });

    return success(res, { message: 'User access rejected', data: { user: user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id/block
 */
const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid user id', statusCode: 400 });
    if (String(id) === String(req.user._id)) {
      return failure(res, { message: 'You cannot block your own account', statusCode: 400 });
    }

    const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
    if (!user) return failure(res, { message: 'User not found', statusCode: 404 });

    return success(res, { message: 'User blocked successfully', data: { user: user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id/unblock
 */
const unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid user id', statusCode: 400 });

    const user = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
    if (!user) return failure(res, { message: 'User not found', statusCode: 404 });

    return success(res, { message: 'User unblocked successfully', data: { user: user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid user id', statusCode: 400 });
    if (String(id) === String(req.user._id)) {
      return failure(res, { message: 'You cannot delete your own account', statusCode: 400 });
    }

    const user = await User.findById(id);
    if (!user) return failure(res, { message: 'User not found', statusCode: 404 });

    const shares = await Share.find({ user: id });
    const shareIds = shares.map((s) => s._id);
    const files = await File.find({ share: { $in: shareIds } });

    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      await deleteFile(file.filePath).catch(() => {});
    }
    await File.deleteMany({ share: { $in: shareIds } });
    await Share.deleteMany({ user: id });
    await user.deleteOne();

    return success(res, { message: 'User and all associated shares deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/shares
 */
const getAllShares = async (req, res, next) => {
  try {
    const { search = '', status } = req.query;
    const query = {};
    if (search) query.shareKey = { $regex: search, $options: 'i' };

    let shares = await Share.find(query).sort({ createdAt: -1 }).populate('user', 'name email');

    if (status) {
      shares = shares.filter((s) => s.status === status);
    }

    return success(res, { message: 'Shares retrieved', data: { shares } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/shares/:id
 */
const getShareById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findById(id).populate('user', 'name email');
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    const files = await File.find({ share: id }).select('-filePath');

    return success(res, { message: 'Share retrieved', data: { share, files } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/shares/:id/disable
 */
const disableShareAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    return success(res, { message: 'Share disabled successfully', data: { share } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/shares/:id
 */
const deleteShareAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findById(id);
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    const files = await File.find({ share: id });
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      await deleteFile(file.filePath).catch(() => {});
    }
    await File.deleteMany({ share: id });
    await share.deleteOne();

    return success(res, { message: 'Share deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/analytics
 */
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [mostActiveUsers, mostDownloadedShares, mostViewedShares, fileTypeStats, recentUploads, recentDownloads] =
      await Promise.all([
        Share.aggregate([
          { $group: { _id: '$user', shareCount: { $sum: 1 }, totalDownloads: { $sum: '$downloads' } } },
          { $sort: { shareCount: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
          { $unwind: '$user' },
          { $project: { 'user.name': 1, 'user.email': 1, shareCount: 1, totalDownloads: 1 } },
        ]),
        Share.find().sort({ downloads: -1 }).limit(5).populate('user', 'name email'),
        Share.find().sort({ views: -1 }).limit(5).populate('user', 'name email'),
        File.aggregate([{ $group: { _id: '$fileType', count: { $sum: 1 }, totalSize: { $sum: '$fileSize' } } }]),
        File.find().sort({ createdAt: -1 }).limit(10).select('-filePath'),
        DownloadHistory.find().sort({ downloadedAt: -1 }).limit(10).populate('share', 'shareKey'),
      ]);

    const storageAgg = await File.aggregate([{ $group: { _id: null, total: { $sum: '$fileSize' } } }]);

    return success(res, {
      message: 'Admin analytics retrieved',
      data: {
        mostActiveUsers,
        mostDownloadedShares,
        mostViewedShares,
        fileTypeStats,
        recentUploads,
        recentDownloads,
        storageUsedBytes: storageAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  getUserById,
  approveUser,
  rejectUser,
  blockUser,
  unblockUser,
  deleteUser,
  getAllShares,
  getShareById,
  disableShareAdmin,
  deleteShareAdmin,
  getAdminAnalytics,
};
