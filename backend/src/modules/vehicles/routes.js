/**
 * src/modules/vehicles/routes.js
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/authenticate');
const { authorize } = require('../../middlewares/authorize');
const { validate } = require('../../middlewares/validate');
const { createVehicleSchema, updateVehicleSchema, vehicleQuerySchema } = require('./schema');
const controller = require('./controller');
const { getOperationalCost } = require('../fuel-expenses/controller');

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

// GET /api/vehicles/available — must come BEFORE /:id to avoid route conflict
router.get(
  '/available',
  authorize('FLEET_MANAGER', 'DRIVER'),
  validate(vehicleQuerySchema, 'query'),
  controller.getAvailableVehicles
);

// POST /api/vehicles
router.post(
  '/',
  authorize('FLEET_MANAGER'),
  validate(createVehicleSchema),
  controller.createVehicle
);

// GET /api/vehicles
router.get(
  '/',
  validate(vehicleQuerySchema, 'query'),
  controller.listVehicles
);

// GET /api/vehicles/:id
router.get('/:id', controller.getVehicle);

// PUT /api/vehicles/:id
router.put(
  '/:id',
  authorize('FLEET_MANAGER'),
  validate(updateVehicleSchema),
  controller.updateVehicle
);

// DELETE /api/vehicles/:id — soft delete (→ RETIRED)
router.delete('/:id', authorize('FLEET_MANAGER'), controller.deleteVehicle);

// GET /api/vehicles/:vehicleId/operational-cost
router.get(
  '/:vehicleId/operational-cost',
  authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'),
  getOperationalCost
);

module.exports = router;
