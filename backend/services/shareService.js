const Share = require('../models/Share');

const EXPIRY_MAP = {
  '10m': 10 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  never: null,
};

/**
 * Converts a sender-selected expiry option ("10m" | "1h" | ... | "never")
 * into an absolute Date, or null for "never expires".
 */
const resolveExpiryDate = (expiryOption) => {
  if (!expiryOption || !(expiryOption in EXPIRY_MAP)) return null;
  const ms = EXPIRY_MAP[expiryOption];
  return ms ? new Date(Date.now() + ms) : null;
};

/**
 * Central gate for whether a share may currently be viewed/downloaded.
 * Every access path (view, download, download-all) must call this -
 * we never rely solely on a background cleanup job.
 */
const assertShareIsAccessible = (share) => {
  if (!share || !share.isActive) {
    const err = new Error('This share is no longer available.');
    err.statusCode = 410;
    throw err;
  }
  if (share.isExpired()) {
    const err = new Error('This share has expired.');
    err.statusCode = 410;
    throw err;
  }
  if (share.oneTimeDownload && share.downloads > 0) {
    const err = new Error('This share is no longer available.');
    err.statusCode = 410;
    throw err;
  }
};

module.exports = { resolveExpiryDate, assertShareIsAccessible };
