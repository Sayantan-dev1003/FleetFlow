/**
 * src/index.js
 * HTTP server entry point.
 * Creates the HTTP server, attaches Socket.io, starts cron jobs, and listens.
 */

const http = require('http');
const app = require('./app');
const { PORT } = require('./config/env');
const { initSocket } = require('./config/socket');
const prisma = require('./config/db');

// ── Create HTTP server (wraps Express) ───────────────────────────────────────
const httpServer = http.createServer(app);

// ── Attach Socket.io ──────────────────────────────────────────────────────────
initSocket(httpServer);

// ── Start cron jobs (license expiry alerts) ───────────────────────────────────
try {
  require('./cron/licenseExpiryCron');
} catch (err) {
  console.warn('[Cron] License expiry cron not started:', err.message);
}

// ── Start listening ───────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║          FleetFlow API — Started           ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║  Port    : ${PORT}                              ║`);
  console.log(`║  Env     : ${process.env.NODE_ENV || 'development'}                      ║`);
  console.log(`║  Health  : http://localhost:${PORT}/health      ║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log('[Server] HTTP server closed. DB disconnected. Bye!');
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled rejections / exceptions
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
  process.exit(1);
});
