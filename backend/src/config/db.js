/**
 * src/config/db.js
 * Prisma client singleton — one connection pool for the entire app.
 */

const { PrismaClient } = require('@prisma/client');
const { isDev } = require('./env');

const prisma = new PrismaClient({
  log: isDev() ? ['query', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

module.exports = prisma;
