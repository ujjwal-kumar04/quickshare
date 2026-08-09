const Share = require('../models/Share');
const File = require('../models/File');
const ViewHistory = require('../models/ViewHistory');
const generateShareKey = require('../utils/generateShareKey');
const { resolveExpiryDate, assertShareIsAccessible } = require('../services/shareService');
const { uploadFile, deleteFile } = require('../services/storage/storageService');
const { getFileCategory } = require('../utils/validators');
const { isValidObjectId } = require('../utils/validators');
const { success, failure } = require('../utils/apiResponse');

/**
 * POST /api/shares
 * Creates a share (text and/or files), optionally password-protected,
 * with an expiry and/or one-time-download setting.
 */
const createShare = async (req, res, next) => {
  try {
    const { text = '', password, expiry, oneTimeDownload } = req.body;
    const files = req.files || [];

    const shareKey = await generateShareKey();

    const share = await Share.create({
      user: req.user._id,
      shareKey,
      text: text.trim(),
      hasFiles: files.length > 0,
      password: password && password.trim() ? password.trim() : null,
      isPasswordProtected: Boolean(password && password.trim()),
      expiryTime: resolveExpiryDate(expiry),
      oneTimeDownload: oneTimeDownload === 'true' || oneTimeDownload === true,
    });

    if (files.length) {
      const fileDocs = [];
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const stored = await uploadFile(file.buffer, file.originalname);
        fileDocs.push({
          share: share._id,
          originalName: file.originalname,
          storedName: stored.storedName,
          fileType: getFileCategory(file.mimetype),
          mimeType: file.mimetype,
          fileSize: file.size,
          filePath: stored.filePath,
          storageType: stored.storageType,
        });
      }
      await File.insertMany(fileDocs);
    }

    return success(res, {
      statusCode: 201,
      message: 'Share created successfully',
      data: {
        shareKey: share.shareKey,
        shareLink: `${process.env.CLIENT_URL}/share/${share.shareKey}`,
        expiryTime: share.expiryTime,
        isPasswordProtected: share.isPasswordProtected,
        oneTimeDownload: share.oneTimeDownload,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shares/:shareKey
 * Public receiver lookup. If password-protected, requires ?password=
 * (or body.password for POST-style clients) before returning content.
 */
const getShareByKey = async (req, res, next) => {
  try {
    const { shareKey } = req.params;
    const providedPassword = req.query.password || req.body?.password;

    const share = await Share.findOne({ shareKey }).select('+password');
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    try {
      assertShareIsAccessible(share);
    } catch (err) {
      return failure(res, { message: err.message, statusCode: err.statusCode || 410 });
    }

    if (share.isPasswordProtected) {
      if (!providedPassword) {
        return success(res, {
          message: 'Password required',
          data: { requiresPassword: true, shareKey: share.shareKey },
        });
      }
      const matches = await share.comparePassword(providedPassword);
      if (!matches) {
        return failure(res, { message: 'Incorrect password', statusCode: 401 });
      }
    }

    const files = await File.find({ share: share._id }).select('-filePath');

    // Record the view (best-effort, non-blocking of the response)
    share.views += 1;
    await share.save();
    await ViewHistory.create({
      share: share._id,
      user: req.user?._id || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    return success(res, {
      message: 'Share retrieved successfully',
      data: {
        shareKey: share.shareKey,
        text: share.text,
        files,
        oneTimeDownload: share.oneTimeDownload,
        expiryTime: share.expiryTime,
        createdAt: share.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shares/my (authenticated) - share history for the logged-in user
 */
const getMyShares = async (req, res, next) => {
  try {
    const shares = await Share.find({ user: req.user._id }).sort({ createdAt: -1 });
    const shareIds = shares.map((s) => s._id);
    const fileCounts = await File.aggregate([
      { $match: { share: { $in: shareIds } } },
      { $group: { _id: '$share', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(fileCounts.map((f) => [String(f._id), f.count]));

    const data = shares.map((s) => ({
      ...s.toObject(),
      fileCount: countMap.get(String(s._id)) || 0,
    }));

    return success(res, { message: 'Shares retrieved', data: { shares: data } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shares/:id/details (authenticated, owner only) - full detail view
 */
const getShareDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findOne({ _id: id, user: req.user._id });
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    const files = await File.find({ share: share._id }).select('-filePath');

    return success(res, { message: 'Share details retrieved', data: { share, files } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/shares/:id (authenticated, owner only)
 */
const updateShare = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findOne({ _id: id, user: req.user._id });
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    const { text, expiry, oneTimeDownload, password, isActive } = req.body;

    if (text !== undefined) share.text = text.trim();
    if (expiry !== undefined) share.expiryTime = resolveExpiryDate(expiry);
    if (oneTimeDownload !== undefined) share.oneTimeDownload = Boolean(oneTimeDownload);
    if (isActive !== undefined) share.isActive = Boolean(isActive);
    if (password !== undefined) {
      share.password = password ? password.trim() : null;
      share.isPasswordProtected = Boolean(password);
    }

    await share.save();
    return success(res, { message: 'Share updated successfully', data: { share } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shares/:id/disable (authenticated, owner only)
 */
const disableShare = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    return success(res, { message: 'Share disabled successfully', data: { share } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/shares/:id (authenticated, owner only)
 * Users can only ever delete their own shares - the query is always
 * scoped to req.user._id, never an admin-level bypass.
 */
const deleteShare = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findOne({ _id: id, user: req.user._id });
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    const files = await File.find({ share: share._id });
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      await deleteFile(file.filePath).catch(() => {});
    }
    await File.deleteMany({ share: share._id });
    await share.deleteOne();

    return success(res, { message: 'Share deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createShare,
  getShareByKey,
  getMyShares,
  getShareDetails,
  updateShare,
  disableShare,
  deleteShare,
};
