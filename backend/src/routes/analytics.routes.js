const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { schemas } = require('../middleware/validation'); // If you have analytics schemas

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: System analytics and metrics
 */

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', verifyToken, analyticsController.getDashboard);

/**
 * @swagger
 * /api/analytics/engagement:
 *   get:
 *     summary: Get user engagement metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 7d
 *     responses:
 *       200:
 *         description: Engagement metrics
 *       401:
 *         description: Unauthorized
 */
router.get('/engagement', verifyToken, analyticsController.getEngagementMetrics);

/**
 * @swagger
 * /api/analytics/responsiveness/{representativeId}:
 *   get:
 *     summary: Get representative responsiveness metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: representativeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 7d
 *     responses:
 *       200:
 *         description: Responsiveness metrics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/responsiveness/:representativeId', verifyToken, checkRole(['admin', 'representative']), analyticsController.getResponseMetrics);

/**
 * @swagger
 * /api/analytics/track:
 *   post:
 *     summary: Track user action
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action_type:
 *                 type: string
 *               resource_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Action tracked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/track', verifyToken, analyticsController.trackAction);

/**
 * @swagger
 * /api/analytics/reports:
 *   get:
 *     summary: Generate analytics reports
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user_activity, policy_views, message_volume]
 *       - in: query
 *         name: county_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Report generated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/reports', verifyToken, checkRole(['admin']), analyticsController.getReports);

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     summary: Export analytics data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user_actions, messages, policy_views]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: Exported data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/export', verifyToken, checkRole(['admin']), analyticsController.exportData);

module.exports = router;