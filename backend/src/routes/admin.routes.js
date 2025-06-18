const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/users', verifyToken, checkRole('admin'), adminController.getUserManagement);
router.get('/system-stats', verifyToken, checkRole('admin'), adminController.getSystemStats);
router.put('/representative/:id/verify', verifyToken, checkRole('admin'), adminController.manageRepresentatives);
router.get('/content-moderation', verifyToken, checkRole('admin'), adminController.moderateContent);
router.get('/health', verifyToken, checkRole('admin'), adminController.systemHealth);
router.get('/reports', verifyToken, checkRole('admin'), adminController.generateReports);

module.exports = router;