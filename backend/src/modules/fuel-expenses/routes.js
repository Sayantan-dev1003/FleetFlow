/**
 * src/modules/fuel-expenses/routes.js
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/authenticate');
const { authorize } = require('../../middlewares/authorize');
const { validate } = require('../../middlewares/validate');
const {
  createFuelLogSchema,
  createExpenseSchema,
  fuelLogQuerySchema,
  expenseQuerySchema,
} = require('./schema');
const controller = require('./controller');

const router = Router();

router.use(authenticate);

// ── Fuel Logs ─────────────────────────────────────────────────────────────────

// POST /api/fuel-logs — Fleet Manager, Driver
router.post(
  '/fuel-logs',
  authorize('FLEET_MANAGER', 'DRIVER'),
  validate(createFuelLogSchema),
  controller.createFuelLog
);

// GET /api/fuel-logs — Fleet Manager, Financial Analyst
router.get(
  '/fuel-logs',
  authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'),
  validate(fuelLogQuerySchema, 'query'),
  controller.listFuelLogs
);

// ── Expenses ──────────────────────────────────────────────────────────────────

// POST /api/expenses — Fleet Manager, Financial Analyst
router.post(
  '/expenses',
  authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'),
  validate(createExpenseSchema),
  controller.createExpense
);

// GET /api/expenses — Fleet Manager, Financial Analyst
router.get(
  '/expenses',
  authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'),
  validate(expenseQuerySchema, 'query'),
  controller.listExpenses
);

module.exports = router;
