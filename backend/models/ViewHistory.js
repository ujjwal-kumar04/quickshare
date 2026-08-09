const mongoose = require('mongoose');

const viewHistorySchema = new mongoose.Schema(
  {
    share: { type: mongoose.Schema.Types.ObjectId, ref: 'Share', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

viewHistorySchema.index({ share: 1, viewedAt: -1 });

module.exports = mongoose.model('ViewHistory', viewHistorySchema);
