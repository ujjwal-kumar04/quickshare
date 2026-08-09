const { customAlphabet } = require('nanoid');
const Share = require('../models/Share');

// Unambiguous, human-readable alphabet (no 0/O/1/I/L confusion).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const nanoid = customAlphabet(ALPHABET, 7);

/**
 * Generates a unique, human-readable share key such as "QS-A8K92XQ".
 * Verifies uniqueness against the database before returning.
 */
const generateShareKey = async () => {
  let key;
  let exists = true;
  let attempts = 0;

  while (exists) {
    if (attempts > 10) {
      throw new Error('Unable to generate a unique share key, please retry.');
    }
    key = `QS-${nanoid()}`;
    // eslint-disable-next-line no-await-in-loop
    exists = await Share.exists({ shareKey: key });
    attempts += 1;
  }

  return key;
};

module.exports = generateShareKey;
