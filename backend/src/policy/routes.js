const express = require('express');
const router = express.Router();
const policyController = require('./controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.post('/', authenticate, authorize('admin'), policyController.createPolicy);
router.get('/', policyController.getPolicies);
router.get('/:id', policyController.getPolicyById);
router.put('/:id', authenticate, authorize('admin'), policyController.updatePolicy);
router.delete('/:id', authenticate, authorize('admin'), policyController.deletePolicy);
router.post('/:id/versions', authenticate, authorize('admin'), policyController.addVersion);

module.exports = router;