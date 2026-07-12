/**
 * src/modules/auth/routes.js
 * Auth routes — public endpoints exempt from authenticate middleware.
 */

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../../middlewares/authenticate');
const { validate } = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('./schema');
const controller = require('./controller');

const router = Router();

// ── Rate Limiters ─────────────────────────────────────────────────────────────

/**
 * Login rate limiter: max 10 attempts per IP per 15-minute window.
 * Prevents brute-force password attacks.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
    },
  },
  skipSuccessfulRequests: true, // Only count failed/non-2xx responses against the limit
});

/**
 * Register rate limiter: max 5 registrations per IP per hour.
 * Prevents bulk account creation.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many registration attempts from this IP. Please try again after 1 hour.',
    },
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', registerLimiter, validate(registerSchema), controller.register);

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), controller.login);

// GET /api/auth/me — requires valid token
router.get('/me', authenticate, controller.getMe);

module.exports = router;
