/**
 * src/middlewares/authorize.js
 * Role-based authorization middleware factory.
 * Usage: router.get('/path', authenticate, authorize('FLEET_MANAGER', 'DRIVER'), handler)
 */

const ApiError = require('../utils/ApiError');

/**
 * Returns an Express middleware that restricts access to users whose role
 * is in the provided allowedRoles list.
 *
 * @param {...string} allowedRoles - One or more RoleName values
 * @returns {import('express').RequestHandler}
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not permitted to access this resource. ` +
            `Required: ${allowedRoles.join(' or ')}.`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
