/**
 * src/middlewares/authenticate.js
 * Verifies the JWT on every request except /api/auth/* routes.
 * Attaches decoded payload to req.user = { userId, role, roleId }.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * authenticate middleware
 * Reads Bearer token from Authorization header, verifies it, and attaches
 * the decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or malformed Authorization header. Expected: Bearer <token>');
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded = { userId, role (RoleName string), roleId, iat, exp }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      roleId: decoded.roleId,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token has expired. Please log in again.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token.'));
    }
    next(err);
  }
};

module.exports = { authenticate };
