/**
 * src/utils/pagination.js
 * Standardized pagination helper for list endpoints.
 */

/**
 * Parse and normalize pagination params from query string.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build standardized pagination metadata for response.
 * @param {number} total - Total record count
 * @param {number} page
 * @param {number} limit
 * @returns {object}
 */
function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePagination, buildPaginationMeta };
