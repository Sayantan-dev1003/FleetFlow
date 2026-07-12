/**
 * src/modules/dashboard/routes.js
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/authenticate');
const { authorize } = require('../../middlewares/authorize');
const controller = require('./controller');

const router = Router();

router.use(authenticate);

// GET /api/dashboard/kpis — All roles (Driver gets limited context via frontend)
router.get('/kpis', authorize('FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'DRIVER'), controller.getKpis);

module.exports = router;
