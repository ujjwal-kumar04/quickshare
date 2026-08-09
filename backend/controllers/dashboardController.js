const Share = require('../models/Share');
const File = require('../models/File');
const DownloadHistory = require('../models/DownloadHistory');
const ViewHistory = require('../models/ViewHistory');
const { success } = require('../utils/apiResponse');

/**
 * GET /api/dashboard/stats
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [totalShares, activeShares, expiredShares, aggTotals, storageAgg] = await Promise.all([
      Share.countDocuments({ user: userId }),
      Share.countDocuments({
        user: userId,
        isActive: true,
        $or: [{ expiryTime: null }, { expiryTime: { $gt: now } }],
      }),
      Share.countDocuments({ user: userId, expiryTime: { $ne: null, $lte: now } }),
      Share.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' }, totalDownloads: { $sum: '$downloads' } } },
      ]),
      File.aggregate([
        { $lookup: { from: 'shares', localField: 'share', foreignField: '_id', as: 'shareDoc' } },
        { $unwind: '$shareDoc' },
        { $match: { 'shareDoc.user': userId } },
        { $group: { _id: null, storageUsed: { $sum: '$fileSize' } } },
      ]),
    ]);

    return success(res, {
      message: 'Dashboard stats retrieved',
      data: {
        totalShares,
        activeShares,
        expiredShares,
        totalViews: aggTotals[0]?.totalViews || 0,
        totalDownloads: aggTotals[0]?.totalDownloads || 0,
        storageUsedBytes: storageAgg[0]?.storageUsed || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/activity
 */
const getActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userShareIds = await Share.find({ user: userId }).distinct('_id');

    const [recentShares, recentDownloads, recentViews] = await Promise.all([
      Share.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
      DownloadHistory.find({ share: { $in: userShareIds } })
        .sort({ downloadedAt: -1 })
        .limit(10)
        .populate('share', 'shareKey'),
      ViewHistory.find({ share: { $in: userShareIds } })
        .sort({ viewedAt: -1 })
        .limit(10)
        .populate('share', 'shareKey'),
    ]);

    return success(res, {
      message: 'Recent activity retrieved',
      data: { recentShares, recentDownloads, recentViews },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/analytics
 * Time-series + breakdown data for dashboard charts.
 */
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [sharesOverTime, downloadsOverTime, viewsOverTime, fileTypeDistribution] = await Promise.all([
      Share.aggregate([
        { $match: { user: userId, createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      DownloadHistory.aggregate([
        { $lookup: { from: 'shares', localField: 'share', foreignField: '_id', as: 'shareDoc' } },
        { $unwind: '$shareDoc' },
        { $match: { 'shareDoc.user': userId, downloadedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$downloadedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ViewHistory.aggregate([
        { $lookup: { from: 'shares', localField: 'share', foreignField: '_id', as: 'shareDoc' } },
        { $unwind: '$shareDoc' },
        { $match: { 'shareDoc.user': userId, viewedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      File.aggregate([
        { $lookup: { from: 'shares', localField: 'share', foreignField: '_id', as: 'shareDoc' } },
        { $unwind: '$shareDoc' },
        { $match: { 'shareDoc.user': userId } },
        { $group: { _id: '$fileType', count: { $sum: 1 } } },
      ]),
    ]);

    return success(res, {
      message: 'Analytics retrieved',
      data: { sharesOverTime, downloadsOverTime, viewsOverTime, fileTypeDistribution },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getActivity, getAnalytics };
