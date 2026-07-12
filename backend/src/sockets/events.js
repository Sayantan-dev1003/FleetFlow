/**
 * src/sockets/events.js
 * Helper functions to emit real-time events on the /ops namespace.
 * Import these in service files to push live updates after state changes.
 */

const { getIO } = require('../config/socket');

/**
 * Emit vehicle status change event.
 * @param {string} vehicleId
 * @param {string} status - VehicleStatus enum value
 * @param {object} [extra] - Optional additional payload
 */
function emitVehicleStatus(vehicleId, status, extra = {}) {
  try {
    getIO().of('/ops').emit('vehicle:statusChanged', { vehicleId, status, ...extra });
  } catch (_) { /* Socket not initialized in test env */ }
}

/**
 * Emit driver status change event.
 * @param {string} driverId
 * @param {string} status - DriverStatus enum value
 * @param {object} [extra]
 */
function emitDriverStatus(driverId, status, extra = {}) {
  try {
    getIO().of('/ops').emit('driver:statusChanged', { driverId, status, ...extra });
  } catch (_) { /* Socket not initialized in test env */ }
}

/**
 * Emit trip lifecycle event.
 * @param {'trip:dispatched'|'trip:completed'|'trip:cancelled'|'trip:created'} event
 * @param {object} tripPayload - Full trip object
 */
function emitTripEvent(event, tripPayload) {
  try {
    getIO().of('/ops').emit(event, tripPayload);
  } catch (_) { /* Socket not initialized in test env */ }
}

/**
 * Emit an updated KPI snapshot to all connected clients.
 * Call this after any state-changing operation.
 * @param {object} kpiSnapshot - Result from dashboard KPI service
 */
function emitKpiUpdate(kpiSnapshot) {
  try {
    getIO().of('/ops').emit('dashboard:kpiUpdate', kpiSnapshot);
  } catch (_) { /* Socket not initialized in test env */ }
}

module.exports = { emitVehicleStatus, emitDriverStatus, emitTripEvent, emitKpiUpdate };
