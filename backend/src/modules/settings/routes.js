const express = require('express');
const controller = require('./controller');
const { authenticate } = require('../../middlewares/authenticate');
const { authorize } = require('../../middlewares/authorize');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getSettings);
router.put('/', authorize('FLEET_MANAGER'), controller.updateSettings);

module.exports = router;
