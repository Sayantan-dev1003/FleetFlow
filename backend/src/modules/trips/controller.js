/**
 * src/modules/trips/controller.js
 */

const tripService = require('./service');
const { emitVehicleStatus, emitDriverStatus, emitTripEvent, emitKpiUpdate } = require('../../sockets/events');
const dashboardService = require('../dashboard/service');

// Helper: after any trip state change, push KPI snapshot to all clients
async function pushKpiUpdate() {
  try {
    const kpi = await dashboardService.getKpis({});
    emitKpiUpdate(kpi);
  } catch (_) { /* non-critical */ }
}

const createTrip = async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body, req.user.userId);
    emitTripEvent('trip:created', trip);
    res.status(201).json({ success: true, data: trip });
  } catch (err) { next(err); }
};

const listTrips = async (req, res, next) => {
  try {
    const result = await tripService.listTrips(req.query, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getTrip = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    res.status(200).json({ success: true, data: trip });
  } catch (err) { next(err); }
};

const dispatchTrip = async (req, res, next) => {
  try {
    const trip = await tripService.dispatchTrip(req.params.id);
    // Emit real-time events for all affected entities
    emitTripEvent('trip:dispatched', trip);
    emitVehicleStatus(trip.vehicleId, 'ON_TRIP', { tripId: trip.id });
    emitDriverStatus(trip.driverId, 'ON_TRIP', { tripId: trip.id });
    await pushKpiUpdate();
    res.status(200).json({ success: true, data: trip });
  } catch (err) { next(err); }
};

const completeTrip = async (req, res, next) => {
  try {
    const trip = await tripService.completeTrip(req.params.id, req.body);
    emitTripEvent('trip:completed', trip);
    emitVehicleStatus(trip.vehicleId, 'AVAILABLE');
    emitDriverStatus(trip.driverId, 'AVAILABLE');
    await pushKpiUpdate();
    res.status(200).json({ success: true, data: trip });
  } catch (err) { next(err); }
};

const cancelTrip = async (req, res, next) => {
  try {
    const trip = await tripService.cancelTrip(req.params.id, req.body?.reason);
    emitTripEvent('trip:cancelled', trip);
    // Only emit status changes if the trip was dispatched (vehicle/driver were locked)
    if (trip.vehicle?.status === 'AVAILABLE') {
      emitVehicleStatus(trip.vehicleId, 'AVAILABLE');
      emitDriverStatus(trip.driverId, 'AVAILABLE');
    }
    await pushKpiUpdate();
    res.status(200).json({ success: true, data: trip });
  } catch (err) { next(err); }
};

module.exports = { createTrip, listTrips, getTrip, dispatchTrip, completeTrip, cancelTrip };
