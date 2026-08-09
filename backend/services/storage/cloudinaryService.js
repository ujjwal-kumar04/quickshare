const cloudinary = require('cloudinary').v2;
const { PassThrough } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary storage backend - same interface as localStorageService so
 * the rest of the app never has to know which one is active.
 */
const uploadFile = (fileBuffer, originalName) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'quickshare' },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          storedName: result.public_id,
          filePath: result.secure_url, // internal reference; downloads still proxy through our API
          storageType: 'cloudinary',
        });
      }
    );
    const bufferStream = new PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });

const getFileStream = async (filePath) => {
  const axios = require('axios');
  const response = await axios.get(filePath, { responseType: 'stream' });
  return response.data;
};

const deleteFile = async (publicId) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
};

module.exports = { uploadFile, getFileStream, deleteFile };
