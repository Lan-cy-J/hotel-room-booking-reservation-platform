const crypto = require('crypto');

/**
 * Generates a human-friendly unique booking number, e.g. BK-20260906-8F2A
 */
function generateBookingNumber(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `BK-${yyyy}${mm}${dd}-${randomSuffix}`;
}

module.exports = {
  generateBookingNumber
};
