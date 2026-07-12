/**
 * src/utils/dateHelpers.js
 * Date utility functions used across the application.
 */

/**
 * Check if a driver's license is still valid.
 * @param {Date | string} expiryDate
 * @returns {boolean}
 */
function isLicenseValid(expiryDate) {
  return new Date(expiryDate) >= new Date();
}

/**
 * Check if a date falls within a given range.
 * @param {Date} date
 * @param {Date | undefined} from
 * @param {Date | undefined} to
 * @returns {boolean}
 */
function isInDateRange(date, from, to) {
  const d = new Date(date);
  if (from && d < new Date(from)) return false;
  if (to && d > new Date(to)) return false;
  return true;
}

/**
 * Build a Prisma date-range filter object.
 * @param {string | undefined} from - ISO date string
 * @param {string | undefined} to   - ISO date string
 * @returns {object | undefined}
 */
function buildDateRangeFilter(from, to) {
  if (!from && !to) return undefined;
  const filter = {};
  if (from) filter.gte = new Date(from);
  if (to) filter.lte = new Date(to);
  return filter;
}

/**
 * Return the date N days from now.
 * @param {number} days
 * @returns {Date}
 */
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

module.exports = { isLicenseValid, isInDateRange, buildDateRangeFilter, daysFromNow };
