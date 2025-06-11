const Policy = require('../models/policy.model');
const { PolicyContent } = require('../models/mongo');
const { extractMetadata } = require('../utils/pdfProcessor');

const policyController = {
  async createPolicy(req, res, next) {
    try {
      const { title, category, content } = req.body;
      
      // Create policy in PostgreSQL
      const policy = await Policy.create({
        title,
        category,
        status: 'draft',
      });

      // Process content and extract metadata
      const metadata = await extractMetadata(content);
      
      // Create policy content in MongoDB
      const policyContent = new PolicyContent({
        policy_id: policy.id,
        versions: [{
          content,
          metadata,
          created_at: new Date(),
        }],
        analysis_data: metadata,
      });
      await policyContent.save();

      res.status(201).json({ policy, content: policyContent });
    } catch (err) {
      next(err);
    }
  },

  async getPolicies(req, res, next) {
    try {
      const policies = await Policy.findAll({
        where: { status: 'published' },
        order: [['created_at', 'DESC']],
      });
      res.json(policies);
    } catch (err) {
      next(err);
    }
  },

  async getPolicyById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get policy from PostgreSQL
      const policy = await Policy.findByPk(id);
      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      // Get content from MongoDB
      const policyContent = await PolicyContent.findOne({ policy_id: id });
      
      res.json({ policy, content: policyContent });
    } catch (err) {
      next(err);
    }
  },

  async updatePolicy(req, res, next) {
    try {
      const { id } = req.params;
      const { title, category, status } = req.body;
      
      const policy = await Policy.findByPk(id);
      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      await policy.update({ title, category, status });
      
      res.json(policy);
    } catch (err) {
      next(err);
    }
  },

  async deletePolicy(req, res, next) {
    try {
      const { id } = req.params;
      
      const policy = await Policy.findByPk(id);
      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      await policy.destroy();
      
      // Also delete content from MongoDB
      await PolicyContent.deleteOne({ policy_id: id });
      
      res.json({ message: 'Policy deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async addVersion(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const policy = await Policy.findByPk(id);
      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      // Process content and extract metadata
      const metadata = await extractMetadata(content);
      
      // Add new version to MongoDB
      const policyContent = await PolicyContent.findOneAndUpdate(
        { policy_id: id },
        {
          $push: {
            versions: {
              content,
              metadata,
              created_at: new Date(),
            },
          },
          $set: { analysis_data: metadata },
        },
        { new: true }
      );

      res.json(policyContent);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = policyController;