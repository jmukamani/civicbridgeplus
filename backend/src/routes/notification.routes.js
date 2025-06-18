const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/auth')

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.post('/preferences', verifyToken, notificationController.updatePreferences);
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);
router.post('/bulk', verifyToken, checkRole('admin'), notificationController.sendBulkNotifications);

module.exports = router;