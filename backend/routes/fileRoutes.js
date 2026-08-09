const express = require('express');
const router = express.Router();

const {
  uploadFilesToShare, downloadFile, previewFile, deleteFileById, downloadAllAsZip,
} = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', authMiddleware, upload.array('files'), uploadFilesToShare);
router.get('/:id/download', downloadFile);
router.get('/:id/preview', previewFile);
router.delete('/:id', authMiddleware, deleteFileById);
router.get('/share/:shareId/download-all', downloadAllAsZip);

module.exports = router;
