/**
 * src/modules/reports/routes.js
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/authenticate');
const { authorize } = require('../../middlewares/authorize');
const controller = require('./controller');

const router = Router();

router.use(authenticate);

// All report routes: Fleet Manager + Financial Analyst
// Safety Officer gets partial access (compliance routes can be added separately)
const reportAuth = authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST');

// GET /api/reports/fuel-efficiency
router.get('/fuel-efficiency', reportAuth, controller.getFuelEfficiency);

// GET /api/reports/fleet-utilization
router.get('/fleet-utilization', reportAuth, controller.getFleetUtilization);

// GET /api/reports/operational-cost
router.get('/operational-cost', reportAuth, controller.getOperationalCost);

// GET /api/reports/roi
router.get('/roi', reportAuth, controller.getRoi);

// GET /api/reports/export?type=<type>&format=csv
router.get('/export', reportAuth, controller.exportReport);

module.exports = router;
