/**
 * src/middlewares/validate.js
 * Zod request validation middleware factory.
 * Validates req.body, req.query, and/or req.params against a Zod schema.
 */

const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source='body']
 * @returns {import('express').RequestHandler}
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // Replace with coerced/transformed values
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Build a field-level error map: { fieldName: 'message' }
        const fieldErrors = {};
        for (const issue of err.issues) {
          const field = issue.path.join('.') || '_root';
          fieldErrors[field] = issue.message;
        }
        return next(ApiError.validationError('Validation failed. Check the error details.', fieldErrors));
      }
      next(err);
    }
  };
};

module.exports = { validate };
