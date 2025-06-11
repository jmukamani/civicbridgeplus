const { Policy } = require('../models/postgres/policy.model');
const { PolicyContent } = require('../models/mongodb/policyContent.model');
const { processPdfDocument, extractMetadata } = require('../processing/pdfProcessor');
const { createVersion } = require('../processing/versionControl');
const { sendNotification } = require('../services/notification.service');

/**
 * @desc Upload and process a new policy document
 * @route POST /api/policies
 * @access Admin
 */
const uploadPolicy = async (req, res) => {
  try {
    const { title, category } = req.body;
    const file = req.file;

    if (!title || !category || !file) {
      return res.status(400).json({ message: 'Title, category and file are required' });
    }

    // Process PDF and extract text
    const { text, pages } = await processPdfDocument(file.buffer);
    const metadata = extractMetadata(text);

    // Create policy in PostgreSQL
    const policy = await Policy.create({
      title,
      status: 'draft',
      category,
      created_by: req.user.id
    });

    // Create policy content in MongoDB
    const policyContent = new PolicyContent({
      policy_id: policy.id,
      versions: [{
        version: 1,
        content: text,
        pages,
        metadata,
        created_at: new Date(),
        created_by: req.user.id
      }],
      analysis_data: {
        keywords: metadata.keywords,
        entities: metadata.entities
      }
    });
    await policyContent.save();

    // Notify relevant users
    await sendNotification({
      type: 'policy_upload',
      policyId: policy.id,
      title: `New policy draft: ${title}`,
      recipients: ['admin', 'rep']
    });

    res.status(201).json({
      id: policy.id,
      title: policy.title,
      status: policy.status,
      version: 1
    });
  } catch (error) {
    console.error('Policy upload error:', error);
    res.status(500).json({ message: 'Error processing policy document' });
  }
};

/**
 * @desc Update a policy document with new version
 * @route PUT /api/policies/:id
 * @access Admin
 */
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { change_reason } = req.body;
    const file = req.file;

    if (!change_reason || !file) {
      return res.status(400).json({ message: 'Change reason and file are required' });
    }

    // Get existing policy
    const policy = await Policy.findByPk(id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Process new PDF version
    const { text, pages } = await processPdfDocument(file.buffer);
    const metadata = extractMetadata(text);

    // Get current policy content
    const policyContent = await PolicyContent.findOne({ policy_id: id });
    if (!policyContent) {
      return res.status(404).json({ message: 'Policy content not found' });
    }

    // Create new version
    const newVersion = await createVersion(policyContent, {
      content: text,
      pages,
      metadata,
      change_reason,
      created_by: req.user.id
    });

    // Update policy in PostgreSQL
    policy.updated_at = new Date();
    await policy.save();

    // Notify users about update
    await sendNotification({
      type: 'policy_update',
      policyId: policy.id,
      title: `Policy updated: ${policy.title}`,
      recipients: ['admin', 'rep', 'citizen'],
      metadata: {
        version: newVersion.version,
        change_reason
      }
    });

    res.status(200).json({
      id: policy.id,
      title: policy.title,
      status: policy.status,
      version: newVersion.version
    });
  } catch (error) {
    console.error('Policy update error:', error);
    res.status(500).json({ message: 'Error updating policy document' });
  }
};

module.exports = {
  uploadPolicy,
  updatePolicy,
};