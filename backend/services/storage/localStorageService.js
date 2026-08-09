const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Local disk storage backend. Conforms to the same interface as
 * cloudinaryService so storageService.js can switch between them
 * transparently via STORAGE_TYPE.
 */
const uploadFile = async (fileBuffer, originalName) => {
  const ext = path.extname(originalName);
  const storedName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const destPath = path.join(UPLOAD_DIR, storedName);

  await fs.promises.writeFile(destPath, fileBuffer);

  return {
    storedName,
    filePath: destPath, // internal only - never sent to the client
    storageType: 'local',
  };
};

const getFileStream = (filePath) => fs.createReadStream(filePath);

const deleteFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
};

module.exports = { uploadFile, getFileStream, deleteFile };
