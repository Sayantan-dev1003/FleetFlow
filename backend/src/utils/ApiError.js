/**
 * src/utils/ApiError.js
 * Custom error class that carries an HTTP status code and an error code string.
 * All service-layer errors should throw this; the centralized errorHandler catches it.
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 500)
   * @param {string} message    - Human-readable message
   * @param {string} [code]     - Machine-readable error code (e.g. 'NOT_FOUND')
   * @param {any}    [details]  - Optional field-level validation errors or extra context
   */
  constructor(statusCode, message, code = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || ApiError.defaultCode(statusCode);
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static defaultCode(statusCode) {
    const map = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[statusCode] || 'ERROR';
  }

  // ── Factory helpers ──────────────────────────────────────────────────────

  static badRequest(message, details = null) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
  }

  static conflict(message) {
    return new ApiError(409, message, 'CONFLICT');
  }

  static validationError(message, details = null) {
    return new ApiError(400, message, 'VALIDATION_ERROR', details);
  }

  static internal(message = 'An unexpected error occurred') {
    return new ApiError(500, message, 'INTERNAL_SERVER_ERROR');
  }
}

module.exports = ApiError;
