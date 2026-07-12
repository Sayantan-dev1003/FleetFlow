/**
 * src/config/socket.js
 * Socket.io setup — attaches to an existing HTTP server.
 * Exports `io` singleton and helper to initialize it.
 *
 * Security: JWT authentication is enforced on the /ops namespace.
 * Clients must send a valid token in the handshake:
 *   const socket = io('/ops', { auth: { token: 'Bearer <jwt>' } });
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { CORS_ORIGIN, JWT_SECRET } = require('./env');

/** @type {import('socket.io').Server | null} */
let io = null;

/**
 * Initialize Socket.io on the given HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Single namespace for fleet operations
  const ops = io.of('/ops');

  // ── JWT Authentication Middleware ─────────────────────────────────────────
  // Every client must provide a valid JWT in socket.handshake.auth.token
  // before any events are delivered.
  ops.use((socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!raw) {
        return next(new Error('Authentication required. Provide token in handshake auth.'));
      }
      // Accept "Bearer <token>" or just "<token>"
      const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = { userId: decoded.userId, role: decoded.role, roleId: decoded.roleId };
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new Error('Token expired. Please log in again.'));
      }
      return next(new Error('Invalid token.'));
    }
  });

  ops.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id} (user: ${socket.user?.userId})`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
    });
  });

  console.log('[Socket] Socket.io initialized on namespace /ops (JWT-secured)');
  return io;
}

/**
 * Get the initialized Socket.io instance.
 * Throws if called before initSocket().
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket(httpServer) first.');
  }
  return io;
}

module.exports = { initSocket, getIO };
