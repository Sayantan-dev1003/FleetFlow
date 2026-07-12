/**
 * src/modules/vehicles/controller.js
 */

const vehicleService = require('./service');
const { emitVehicleStatus } = require('../../sockets/events');

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

const listVehicles = async (req, res, next) => {
  try {
    const result = await vehicleService.listVehicles(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.status(200).json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    if (req.body.status) emitVehicleStatus(vehicle.id, vehicle.status);
    res.status(200).json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.deleteVehicle(req.params.id);
    emitVehicleStatus(vehicle.id, 'RETIRED');
    res.status(200).json({ success: true, data: { message: 'Vehicle retired successfully.', vehicle } });
  } catch (err) { next(err); }
};

const getAvailableVehicles = async (req, res, next) => {
  try {
    const result = await vehicleService.getAvailableVehicles(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { createVehicle, listVehicles, getVehicle, updateVehicle, deleteVehicle, getAvailableVehicles };
