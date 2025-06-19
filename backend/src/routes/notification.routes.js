const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/auth')

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications and preferences
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
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
 *         name: read
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of notifications with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, notificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', verifyToken, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/preferences:
 *   post:
 *     summary: Update notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *               push:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preferences updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/preferences', verifyToken, notificationController.updatePreferences);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     summary: Send bulk notifications (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - user_ids
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               notification_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notifications created for users
 *       400:
 *         description: Validation error or invalid user IDs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/bulk', verifyToken, checkRole('admin'), notificationController.sendBulkNotifications);

module.exports = router;