const archiver = require('archiver');
const File = require('../models/File');
const Share = require('../models/Share');
const DownloadHistory = require('../models/DownloadHistory');
const { uploadFile, getFileStream, deleteFile } = require('../services/storage/storageService');
const { assertShareIsAccessible } = require('../services/shareService');
const { getFileCategory, isValidObjectId } = require('../utils/validators');
const { success, failure } = require('../utils/apiResponse');

const PREVIEWABLE_TYPES = new Set(['image', 'pdf', 'txt']);

/**
 * POST /api/files/upload (authenticated, owner only)
 * Adds one or more files to an existing share the user owns.
 */
const uploadFilesToShare = async (req, res, next) => {
  try {
    const { shareId } = req.body;
    if (!isValidObjectId(shareId)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findOne({ _id: shareId, user: req.user._id });
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    const files = req.files || [];
    if (!files.length) return failure(res, { message: 'No files provided', statusCode: 400 });

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
    const inserted = await File.insertMany(fileDocs);

    share.hasFiles = true;
    await share.save();

    const safe = inserted.map((f) => {
      const obj = f.toObject();
      delete obj.filePath;
      return obj;
    });

    return success(res, { statusCode: 201, message: 'Files uploaded successfully', data: { files: safe } });
  } catch (err) {
    next(err);
  }
};

/**
 * Shared helper: loads a file + its parent share and validates access
 * (expiry, active state, one-time-download, password if provided).
 */
const loadAccessibleFile = async (fileId, { password } = {}) => {
  if (!isValidObjectId(fileId)) {
    const err = new Error('Invalid file id');
    err.statusCode = 400;
    throw err;
  }

  const file = await File.findById(fileId).select('+filePath');
  if (!file) {
    const err = new Error('File not found');
    err.statusCode = 404;
    throw err;
  }

  const share = await Share.findById(file.share).select('+password');
  assertShareIsAccessible(share);

  if (share.isPasswordProtected) {
    const matches = password && (await share.comparePassword(password));
    if (!matches) {
      const err = new Error('Password required or incorrect');
      err.statusCode = 401;
      throw err;
    }
  }

  return { file, share };
};

/**
 * GET /api/files/:id/download
 */
const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.query;

    const { file, share } = await loadAccessibleFile(id, { password });

    const stream = await getFileStream(file.filePath);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.mimeType);

    stream.pipe(res);

    stream.on('end', async () => {
      share.downloads += 1;
      if (share.oneTimeDownload) share.isActive = false;
      await share.save();
      await DownloadHistory.create({
        share: share._id,
        file: file._id,
        user: req.user?._id || null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      });
    });
  } catch (err) {
    if (err.statusCode) return failure(res, { message: err.message, statusCode: err.statusCode });
    next(err);
  }
};

/**
 * GET /api/files/:id/preview
 * Only serves inline previews for image / pdf / plain-text files.
 */
const previewFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.query;

    const { file } = await loadAccessibleFile(id, { password });

    if (!PREVIEWABLE_TYPES.has(file.fileType)) {
      return failure(res, { message: 'Preview not supported for this file type', statusCode: 415 });
    }

    const stream = await getFileStream(file.filePath);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', 'inline');
    stream.pipe(res);
  } catch (err) {
    if (err.statusCode) return failure(res, { message: err.message, statusCode: err.statusCode });
    next(err);
  }
};

/**
 * DELETE /api/files/:id (authenticated, owner only)
 */
const deleteFileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return failure(res, { message: 'Invalid file id', statusCode: 400 });

    const file = await File.findById(id).select('+filePath');
    if (!file) return failure(res, { message: 'File not found', statusCode: 404 });

    const share = await Share.findOne({ _id: file.share, user: req.user._id });
    if (!share) return failure(res, { message: 'Not authorized to delete this file', statusCode: 403 });

    await deleteFile(file.filePath).catch(() => {});
    await file.deleteOne();

    const remaining = await File.countDocuments({ share: share._id });
    if (remaining === 0) {
      share.hasFiles = false;
      await share.save();
    }

    return success(res, { message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/files/share/:shareId/download-all
 * Streams a ZIP built on the fly - files are never pre-zipped on disk.
 */
const downloadAllAsZip = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const { password } = req.query;

    if (!isValidObjectId(shareId)) return failure(res, { message: 'Invalid share id', statusCode: 400 });

    const share = await Share.findById(shareId).select('+password');
    if (!share) return failure(res, { message: 'Share not found', statusCode: 404 });

    try {
      assertShareIsAccessible(share);
    } catch (err) {
      return failure(res, { message: err.message, statusCode: err.statusCode || 410 });
    }

    if (share.isPasswordProtected) {
      const matches = password && (await share.comparePassword(password));
      if (!matches) return failure(res, { message: 'Password required or incorrect', statusCode: 401 });
    }

    const files = await File.find({ share: share._id }).select('+filePath');
    if (!files.length) return failure(res, { message: 'No files to download', statusCode: 404 });

    res.setHeader('Content-Disposition', `attachment; filename="${share.shareKey}.zip"`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => next(err));
    archive.pipe(res);

    for (const file of files) {
      const stream = await getFileStream(file.filePath);
      archive.append(stream, { name: file.originalName });
    }

    await archive.finalize();

    share.downloads += 1;
    if (share.oneTimeDownload) share.isActive = false;
    await share.save();
    await DownloadHistory.create({
      share: share._id,
      file: null,
      user: req.user?._id || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFilesToShare, downloadFile, previewFile, deleteFileById, downloadAllAsZip };
