/**
 * src/middlewares/errorHandler.js
 * Centralized error handling middleware.
 * All errors funnel here and are normalized to the standard response envelope:
 *   { success: false, error: { code, message, details? } }
 */

const ApiError = require('../utils/ApiError');
const { isDev } = require('../config/env');

/**
 * Handles Prisma-specific errors and maps them to ApiError instances.
 * @param {Error} err
 * @returns {ApiError | null}
 */
function handlePrismaError(err) {
  // Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
  if (err.code === 'P2002') {
    // Unique constraint violation
    const fields = err.meta?.target?.join(', ') || 'field';
    return ApiError.conflict(`A record with the same ${fields} already exists.`);
  }
  if (err.code === 'P2025') {
    // Record not found (e.g. update/delete on non-existent record)
    return ApiError.notFound(err.meta?.cause || 'Record');
  }
  if (err.code === 'P2003') {
    // Foreign key constraint violation
    return ApiError.badRequest('Related record not found. Check the provided IDs.');
  }
  if (err.code === 'P2014') {
    return ApiError.badRequest('The change would violate a required relation.');
  }
  return null;
}

/**
 * Express 4-argument error middleware.
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Try to convert Prisma errors first
  const prismaError = handlePrismaError(err);
  if (prismaError) {
    return res.status(prismaError.statusCode).json({
      success: false,
      error: {
        code: prismaError.code,
        message: prismaError.message,
      },
    });
  }

  // Known ApiError
  if (err instanceof ApiError) {
    const body = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) body.error.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // Unknown / unhandled error
  console.error('[Unhandled Error]', err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      // Expose stack only in development
      ...(isDev() ? { stack: err.stack } : {}),
    },
  });
};

module.exports = { errorHandler };
