const express = require('express');
const router = express.Router();
const PolicyController = require('../controllers/policy.controller');
const { auth } = require('../middleware/auth');
const { rbac } = require('../middleware/rbac');
const { fileUpload } = require('../middleware/fileUpload');

router.post(
  '/',
  auth,
  rbac(['admin', 'representative']),
  fileUpload('document'),
  PolicyController.createPolicy
);

router.get(
  '/county/:countyId',
  auth,
  PolicyController.getPoliciesByCounty
);

router.get(
  '/search',
  auth,
  PolicyController.searchPolicies
);

module.exports = router;