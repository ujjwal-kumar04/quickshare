const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const shareSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shareKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    text: {
      type: String,
      default: '',
    },
    hasFiles: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      select: false,
      default: null,
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    expiryTime: {
      type: Date,
      default: null, // null = never expires
      index: true,
    },
    oneTimeDownload: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

shareSchema.index({ user: 1, createdAt: -1 });

shareSchema.pre('save', async function hashSharePassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

shareSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

shareSchema.methods.isExpired = function isExpired() {
  if (!this.expiryTime) return false;
  return Date.now() > new Date(this.expiryTime).getTime();
};

shareSchema.virtual('status').get(function getStatus() {
  if (!this.isActive) return 'disabled';
  if (this.isExpired()) return 'expired';
  if (this.oneTimeDownload && this.downloads > 0) return 'used';
  return 'active';
});

shareSchema.set('toJSON', { virtuals: true });
shareSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Share', shareSchema);
