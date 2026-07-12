/**
 * src/modules/drivers/routes.js
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/authenticate');
const { authorize } = require('../../middlewares/authorize');
const { validate } = require('../../middlewares/validate');
const { createDriverSchema, updateDriverSchema, driverQuerySchema } = require('./schema');
const controller = require('./controller');

const router = Router();

router.use(authenticate);

// GET /api/drivers/available — BEFORE /:id
router.get(
  '/available',
  authorize('FLEET_MANAGER', 'DRIVER'),
  validate(driverQuerySchema, 'query'),
  controller.getAvailableDrivers
);

// POST /api/drivers — Safety Officer only
router.post('/', authorize('SAFETY_OFFICER'), validate(createDriverSchema), controller.createDriver);

// GET /api/drivers — All roles
router.get('/', validate(driverQuerySchema, 'query'), controller.listDrivers);

// GET /api/drivers/:id — All roles
router.get('/:id', controller.getDriver);

// PUT /api/drivers/:id — Safety Officer only
router.put('/:id', authorize('SAFETY_OFFICER'), validate(updateDriverSchema), controller.updateDriver);

// DELETE /api/drivers/:id — Safety Officer only (soft: → SUSPENDED)
router.delete('/:id', authorize('SAFETY_OFFICER'), controller.deleteDriver);

module.exports = router;
