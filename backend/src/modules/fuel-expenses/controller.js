/**
 * src/modules/fuel-expenses/controller.js
 */

const fuelExpenseService = require('./service');

const createFuelLog = async (req, res, next) => {
  try {
    const log = await fuelExpenseService.createFuelLog(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err) { next(err); }
};

const listFuelLogs = async (req, res, next) => {
  try {
    const result = await fuelExpenseService.listFuelLogs(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const createExpense = async (req, res, next) => {
  try {
    const expense = await fuelExpenseService.createExpense(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) { next(err); }
};

const listExpenses = async (req, res, next) => {
  try {
    const result = await fuelExpenseService.listExpenses(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getOperationalCost = async (req, res, next) => {
  try {
    const data = await fuelExpenseService.getOperationalCost(req.params.vehicleId);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { createFuelLog, listFuelLogs, createExpense, listExpenses, getOperationalCost };
