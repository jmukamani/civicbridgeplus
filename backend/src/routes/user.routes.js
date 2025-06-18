const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, checkRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/fileUpload');

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.get('/representatives', verifyToken, userController.getRepresentatives);
router.put('/representative/verify', verifyToken, checkRole('admin'), userController.verifyRepresentative);
router.get('/search', verifyToken, userController.searchUsers);
router.get('/stats', verifyToken, userController.getUserStats);

module.exports = router;