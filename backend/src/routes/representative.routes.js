const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const representativeController = require('../controllers/representative.controller');

/**
 * @swagger
 * /api/representatives/metrics:
 *   get:
 *     summary: Get representative dashboard metrics
 *     tags: [Representatives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Representative metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pendingMessages:
 *                       type: number
 *                     publishedPolicies:
 *                       type: number
 *                     constituents:
 *                       type: number
 *                     avgResponseTime:
 *                       type: number
 */
router.get('/metrics', verifyToken, checkRole('representative'), representativeController.getMetrics);

/**
 * @swagger
 * /api/representatives/activity:
 *   get:
 *     summary: Get representative activity data
 *     tags: [Representatives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Representative activity data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       incoming:
 *                         type: number
 *                       outgoing:
 *                         type: number
 */
router.get('/activity', verifyToken, checkRole('representative'), representativeController.getActivity);

module.exports = router; 