/**
 * src/modules/drivers/controller.js
 */

const driverService = require('./service');
const { emitDriverStatus } = require('../../sockets/events');

const createDriver = async (req, res, next) => {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (err) { next(err); }
};

const listDrivers = async (req, res, next) => {
  try {
    const result = await driverService.listDrivers(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getDriver = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    res.status(200).json({ success: true, data: driver });
  } catch (err) { next(err); }
};

const updateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    if (req.body.status) emitDriverStatus(driver.id, driver.status);
    res.status(200).json({ success: true, data: driver });
  } catch (err) { next(err); }
};

const deleteDriver = async (req, res, next) => {
  try {
    const driver = await driverService.deleteDriver(req.params.id);
    emitDriverStatus(driver.id, 'SUSPENDED');
    res.status(200).json({ success: true, data: { message: 'Driver suspended (soft-deleted) successfully.', driver } });
  } catch (err) { next(err); }
};

const getAvailableDrivers = async (req, res, next) => {
  try {
    const result = await driverService.getAvailableDrivers(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { createDriver, listDrivers, getDriver, updateDriver, deleteDriver, getAvailableDrivers };
