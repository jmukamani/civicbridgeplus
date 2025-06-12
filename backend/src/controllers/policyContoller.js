import * as policyService from '../services/policyService.js';
import * as smsService from '../services/smsService.js';
import logger from '../config/logger.js';

export const createPolicy = async (req, res) => {
  try {
    const { title, category } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }
    
    const policy = await policyService.createPolicy(
      { title, category },
      file.buffer
    );
    
    // Notify subscribers via SMS
    await smsService.notifySubscribers(
      `New policy: ${title}. View at ${process.env.APP_URL}/policies/${policy.id}`
    );
    
    res.status(201).json(policy);
  } catch (error) {
    logger.error(`Policy creation error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create policy' });
  }
};

export const getPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const language = req.user?.preferred_language || 'en';
    const policy = await policyService.getPolicyWithContent(id, language);
    
    // Track view in analytics
    await policyService.trackPolicyView(
      id, 
      req.user?.id || null, 
      req.headers['user-agent']
    );
    
    res.json(policy);
  } catch (error) {
    logger.error(`Policy fetch error: ${error.message}`);
    res.status(404).json({ error: 'Policy not found' });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { id: policyId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    
    const feedback = await policyService.submitFeedback(policyId, userId, comment);
    res.status(201).json(feedback);
  } catch (error) {
    logger.error(`Feedback error: ${error.message}`);
    res.status(400).json({ error: 'Failed to submit feedback' });
  }
};

export const handleSMSWebhook = async (req, res) => {
  try {
    const response = await smsService.handleIncomingSMS(req.body);
    res.status(200).send(response);
  } catch (error) {
    logger.error(`SMS webhook error: ${error.message}`);
    res.status(400).send('Invalid request');
  }
};

export const searchPolicies = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await policyService.searchPolicies(query);
    res.json(results);
  } catch (error) {
    logger.error(`Search error: ${error.message}`);
    res.status(500).json({ error: 'Search failed' });
  }
};