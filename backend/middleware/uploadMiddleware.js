const multer = require('multer');
const path = require('path');
const { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } = require('../utils/validators');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10MB
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_SHARE, 10) || 10;

// Use memory storage - the storageService decides where the buffer ends up
// (local disk in dev, Cloudinary/S3 in production). Keeps upload logic
// decoupled from the storage backend per the storage service abstraction.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Never trust the client-reported mimetype or extension alone; both are
  // checked, and the storage service re-validates before writing to disk.
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Unsupported file type: ${file.originalname}`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

module.exports = upload;
