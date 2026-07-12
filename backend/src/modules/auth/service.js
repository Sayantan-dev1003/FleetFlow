/**
 * src/modules/auth/service.js
 * Business logic for authentication: register, login, getMe.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');
const ApiError = require('../../utils/ApiError');

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, roleName: string }} data
 */
async function register({ name, email, password, roleName }) {
  // Find the role by name
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    throw ApiError.badRequest(`Role '${roleName}' does not exist. Run the seed script first.`);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user — Prisma will throw P2002 on duplicate email, caught by errorHandler
  const user = await prisma.user.create({
    data: { name, email, passwordHash, roleId: role.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });

  const token = signToken(user.id, user.role.name, user.role.id);

  return { user, token };
}

/**
 * Authenticate user and return JWT.
 * @param {{ email: string, password: string }} credentials
 */
async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    // Use the same message to avoid email enumeration
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (user.lockedUntil && new Date() < user.lockedUntil) {
    throw ApiError.unauthorized('Account locked due to 5 failed attempts. Please try again later.');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    if (attempts >= 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockedUntil: new Date(Date.now() + 15 * 60000) }
      });
      throw ApiError.unauthorized('Account locked due to 5 failed attempts. Please try again later.');
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts }
      });
      throw ApiError.unauthorized('Invalid email or password.');
    }
  }

  // Reset counters on successful login
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null }
    });
  }

  const token = signToken(user.id, user.role.name, user.role.id);

  return {
    token,
    expiresIn: JWT_EXPIRES_IN,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: { id: user.role.id, name: user.role.name },
    },
  };
}

/**
 * Get current user profile from userId in JWT.
 * @param {string} userId
 */
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true } },
      driver: {
        select: { id: true, safetyScore: true, status: true, licenseExpiryDate: true },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound('User');
  }

  return user;
}

// ── Private helpers ──────────────────────────────────────────────────────────

function signToken(userId, role, roleId) {
  return jwt.sign({ userId, role, roleId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

module.exports = { register, login, getMe };
