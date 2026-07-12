/**
 * src/modules/maintenance/routes.js
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/authenticate');
const { authorize } = require('../../middlewares/authorize');
const { validate } = require('../../middlewares/validate');
const { createMaintenanceSchema, closeMaintenanceSchema, maintenanceQuerySchema } = require('./schema');
const controller = require('./controller');

const router = Router();

router.use(authenticate);

// POST /api/maintenance — Fleet Manager only
router.post('/', authorize('FLEET_MANAGER'), validate(createMaintenanceSchema), controller.openMaintenance);

// GET /api/maintenance — Fleet Manager, Financial Analyst
router.get(
  '/',
  authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'),
  validate(maintenanceQuerySchema, 'query'),
  controller.listMaintenance
);

// GET /api/maintenance/:id
router.get('/:id', authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER'), controller.getMaintenance);

// POST /api/maintenance/:id/close — Fleet Manager only
router.post(
  '/:id/close',
  authorize('FLEET_MANAGER'),
  validate(closeMaintenanceSchema),
  controller.closeMaintenance
);

module.exports = router;
