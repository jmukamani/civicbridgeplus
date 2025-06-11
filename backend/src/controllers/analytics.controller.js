const { Analytics } = require('../models/postgres/analytics.model');
const { generateReport } = require('../services/report.service');

/**
 * @desc Track user interaction with a policy
 * @route POST /api/analytics/interaction
 * @access Authenticated
 */
const trackInteraction = async (req, res) => {
  try {
    const { policyId, interactionType } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!policyId || !interactionType) {
      return res.status(400).json({ message: 'Policy ID and interaction type are required' });
    }

    // Record interaction
    await Analytics.create({
      user_id: userId,
      policy_id: policyId,
      interaction_type: interactionType,
      timestamp: new Date()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ message: 'Error tracking interaction' });
  }
};

/**
 * @desc Generate engagement report
 * @route GET /api/analytics/report
 * @access Admin
 */
const generateEngagementReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'pdf' } = req.query;

    // Generate report
    const report = await generateReport({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      format
    });

    // Set appropriate headers based on format
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=engagement_report.pdf');
      res.send(report);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=engagement_report.csv');
      res.send(report);
    } else {
      res.status(400).json({ message: 'Invalid report format' });
    }
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

module.exports = {
  trackInteraction,
  generateEngagementReport
};