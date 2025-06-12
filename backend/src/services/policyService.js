const Policy = require('../models/postgres/Policy');
const PolicyContent = require('../models/mongodb/PolicyContent');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

const createPolicy = async (policyData, file) => {
  try {
    // Create policy record in PostgreSQL
    const policy = await Policy.create(policyData);

    // Process file content if provided
    if (file) {
      const content = await processDocument(file);
      
      // Create policy content in MongoDB
      await PolicyContent.create({
        policyId: policy.id,
        versions: [{
          version: 1,
          content: content.text,
          createdBy: policyData.createdBy,
        }],
        metadata: {
          wordCount: content.wordCount,
          pageCount: content.pageCount,
          fileType: file.mimetype,
          fileSize: file.size,
        },
      });
    }

    return policy;
  } catch (error) {
    console.error('Policy creation error:', error);
    throw error;
  }
};

const processDocument = async (file) => {
  try {
    let text = '';
    let wordCount = 0;
    let pageCount = 1;

    if (file.mimetype === 'application/pdf') {
      const buffer = await fs.readFile(file.path);
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
      pageCount = pdfData.numpages;
    } else if (file.mimetype === 'text/plain') {
      text = await fs.readFile(file.path, 'utf8');
    }

    wordCount = text.split(/\s+/).length;

    return {
      text,
      wordCount,
      pageCount,
    };
  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
};

const updatePolicyVersion = async (policyId, newContent, userId) => {
  try {
    const policyContent = await PolicyContent.findOne({ policyId });
    if (!policyContent) {
      throw new Error('Policy content not found');
    }

    const newVersion = policyContent.versions.length + 1;
    policyContent.versions.push({
      version: newVersion,
      content: newContent,
      createdBy: userId,
    });

    await policyContent.save();
    return policyContent;
  } catch (error) {
    console.error('Policy version update error:', error);
    throw error;
  }
};

module.exports = {
  createPolicy,
  processDocument,
  updatePolicyVersion,
};