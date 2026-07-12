/**
 * src/modules/maintenance/controller.js
 */

const maintenanceService = require('./service');
const { emitVehicleStatus, emitKpiUpdate } = require('../../sockets/events');
const dashboardService = require('../dashboard/service');

async function pushKpiUpdate() {
  try {
    const kpi = await dashboardService.getKpis({});
    emitKpiUpdate(kpi);
  } catch (_) {}
}

const openMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.openMaintenance(req.body);
    emitVehicleStatus(log.vehicleId, 'IN_SHOP', { maintenanceId: log.id });
    await pushKpiUpdate();
    res.status(201).json({ success: true, data: log });
  } catch (err) { next(err); }
};

const listMaintenance = async (req, res, next) => {
  try {
    const result = await maintenanceService.listMaintenance(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.getMaintenanceById(req.params.id);
    res.status(200).json({ success: true, data: log });
  } catch (err) { next(err); }
};

const closeMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.closeMaintenance(req.params.id, req.body);
    // Emit vehicle status (could be AVAILABLE or still RETIRED)
    emitVehicleStatus(log.vehicleId, log.vehicle.status);
    await pushKpiUpdate();
    res.status(200).json({ success: true, data: log });
  } catch (err) { next(err); }
};

module.exports = { openMaintenance, listMaintenance, getMaintenance, closeMaintenance };
