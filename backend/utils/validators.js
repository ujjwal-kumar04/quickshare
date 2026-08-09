const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(String(email || '').trim());

const isStrongEnoughPassword = (password) =>
  typeof password === 'string' && password.length >= 8;

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.zip',
]);

const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'xls';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';
  if (mimeType.includes('zip')) return 'zip';
  if (mimeType === 'text/csv') return 'csv';
  if (mimeType === 'text/plain') return 'txt';
  return 'other';
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isStrongEnoughPassword,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  getFileCategory,
};
