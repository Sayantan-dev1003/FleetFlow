const express = require('express');
const controller = require('./controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getSettings);
router.put('/', authorize('FLEET_MANAGER'), controller.updateSettings);

module.exports = router;
