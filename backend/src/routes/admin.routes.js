const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations and management
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get user management data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: county_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: constituency_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of users with pagination
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users', verifyToken, checkRole('admin'), adminController.getUserManagement);

/**
 * @swagger
 * /api/admin/system-stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics and recent activities
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/system-stats', verifyToken, checkRole('admin'), adminController.getSystemStats);

/**
 * @swagger
 * /api/admin/representative/{id}/verify:
 *   put:
 *     summary: Verify or update representative status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Representative status updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Representative not found
 */
router.put('/representative/:id/verify', verifyToken, checkRole('admin'), adminController.manageRepresentatives);

/**
 * @swagger
 * /api/admin/content-moderation:
 *   get:
 *     summary: Get content moderation data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Content moderation data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/content-moderation', verifyToken, checkRole('admin'), adminController.moderateContent);

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Get system health status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/health', verifyToken, checkRole('admin'), adminController.systemHealth);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Generate administrative reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user_registration, policy_uploads, message_traffic, system_usage]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
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
router.get('/reports', verifyToken, checkRole('admin'), adminController.generateReports);

module.exports = router;