const PolicyService = require('../services/policy.service');
const { response } = require('../utils/response');

class PolicyController {
  async createPolicy(req, res) {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }

      const policy = await PolicyService.createPolicy({
        ...req.body,
        uploadedBy: req.user.id,
        fileBuffer: req.file.buffer
      });

      response(res, 201, 'Policy created successfully', { policy });
    } catch (err) {
      response(res, 400, err.message);
    }
  }

  async getPoliciesByCounty(req, res) {
    try {
      const policies = await PolicyService.getPoliciesByCounty(req.params.countyId);
      response(res, 200, 'Policies retrieved', { policies });
    } catch (err) {
      response(res, 400, err.message);
    }
  }

  async searchPolicies(req, res) {
    try {
      const policies = await PolicyService.searchPolicies(
        req.query.q,
        req.user.countyId
      );
      response(res, 200, 'Search results', { policies });
    } catch (err) {
      response(res, 400, err.message);
    }
  }
}

module.exports = new PolicyController();