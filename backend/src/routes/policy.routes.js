const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller.js');
const { verifyToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/fileUpload');

router.get('/', verifyToken, policyController.getAllPolicies);
router.get('/:id', verifyToken, policyController.getPolicyById);
router.post('/', verifyToken, uploadSingle('file'), validate(schemas.policy), policyController.createPolicy);
router.put('/:id', verifyToken, uploadSingle('file'), policyController.updatePolicy);
router.delete('/:id', verifyToken, policyController.deletePolicy);
router.get('/search', verifyToken, policyController.searchPolicies);
router.get('/county/:countyId', verifyToken, policyController.getPoliciesByCounty);
router.get('/:id/download', verifyToken, policyController.downloadPolicy);

module.exports = router;