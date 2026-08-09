const { customAlphabet } = require('nanoid');
const Share = require('../models/Share');

// Only digits 1-9, exactly 4 digits
const nanoid = customAlphabet('123456789', 4);

/**
 * Generates a unique share key such as "QS-5831".
 * Verifies uniqueness against the database before returning.
 */
const generateShareKey = async () => {
  let key;
  let exists = true;
  let attempts = 0;

  while (exists) {
    if (attempts > 10) {
      throw new Error(
        'Unable to generate a unique share key, please retry.'
      );
    }

    key = `QS-${nanoid()}`;

    // Check if key already exists in database
    // eslint-disable-next-line no-await-in-loop
    exists = await Share.exists({ shareKey: key });

    attempts += 1;
  }

  return key;
};

module.exports = generateShareKey;