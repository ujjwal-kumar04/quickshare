const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    share: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Share',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storedName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String, // e.g. image, pdf, doc, xls, ppt, zip, txt, other
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    // Internal storage reference only (local path or cloud public_id/URL).
    // Never sent to the client directly - see storageService.
    filePath: {
      type: String,
      required: true,
      select: false,
    },
    storageType: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

fileSchema.index({ share: 1, createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);
