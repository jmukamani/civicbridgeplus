const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, checkRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/fileUpload');

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', verifyToken, userController.getProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', verifyToken, userController.updateProfile);

/**
 * @swagger
 * /representatives:
 *   get:
 *     summary: Get a list of representatives
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of representatives
 *       401:
 *         description: Unauthorized
 */
router.get('/representatives', verifyToken, userController.getRepresentatives);

/**
 * @swagger
 * /representative/verify:
 *   put:
 *     summary: Verify a representative (admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Representative verified
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/representative/verify', verifyToken, checkRole('admin'), userController.verifyRepresentative);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 */
router.get('/search', verifyToken, userController.searchUsers);

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', verifyToken, userController.getUserStats);

module.exports = router;