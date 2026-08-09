const mongoose = require('mongoose');

const downloadHistorySchema = new mongoose.Schema(
  {
    share: { type: mongoose.Schema.Types.ObjectId, ref: 'Share', required: true, index: true },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    downloadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

downloadHistorySchema.index({ share: 1, downloadedAt: -1 });

module.exports = mongoose.model('DownloadHistory', downloadHistorySchema);
