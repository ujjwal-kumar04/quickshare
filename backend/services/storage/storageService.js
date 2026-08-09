const localStorageService = require('./localStorageService');
const cloudinaryService = require('./cloudinaryService');

/**
 * Storage abstraction. Switch backends purely via STORAGE_TYPE env var -
 * no other code in the app should import localStorageService or
 * cloudinaryService directly.
 */
const getActiveService = () =>
  process.env.STORAGE_TYPE === 'cloudinary' ? cloudinaryService : localStorageService;

const uploadFile = (buffer, originalName) => getActiveService().uploadFile(buffer, originalName);
const getFileStream = (filePath) => getActiveService().getFileStream(filePath);
const deleteFile = (filePath) => getActiveService().deleteFile(filePath);

module.exports = { uploadFile, getFileStream, deleteFile };
