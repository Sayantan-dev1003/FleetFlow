/**
 * src/modules/trips/routes.js
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/authenticate');
const { authorize } = require('../../middlewares/authorize');
const { validate } = require('../../middlewares/validate');
const { createTripSchema, completeTripSchema, cancelTripSchema, tripQuerySchema } = require('./schema');
const controller = require('./controller');

const router = Router();

router.use(authenticate);

// POST /api/trips
router.post(
  '/',
  authorize('FLEET_MANAGER', 'DRIVER'),
  validate(createTripSchema),
  controller.createTrip
);

// GET /api/trips — Driver sees own trips by default (enforced in service)
router.get('/', validate(tripQuerySchema, 'query'), controller.listTrips);

// GET /api/trips/:id
router.get('/:id', controller.getTrip);

// POST /api/trips/:id/dispatch
router.post('/:id/dispatch', authorize('FLEET_MANAGER', 'DRIVER'), controller.dispatchTrip);

// POST /api/trips/:id/complete
router.post(
  '/:id/complete',
  authorize('FLEET_MANAGER', 'DRIVER'),
  validate(completeTripSchema),
  controller.completeTrip
);

// POST /api/trips/:id/cancel
router.post(
  '/:id/cancel',
  authorize('FLEET_MANAGER', 'DRIVER'),
  validate(cancelTripSchema),
  controller.cancelTrip
);

module.exports = router;
