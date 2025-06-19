const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller.js');
const { verifyToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/fileUpload');

/**
 * @swagger
 * tags:
 *   name: Policies
 *   description: Policy documents and management
 */

/**
 * @swagger
 * /api/policies:
 *   get:
 *     summary: Get all policies with filtering and pagination
 *     tags: [Policies]
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
 *         name: county_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of policies with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, policyController.getAllPolicies);

/**
 * @swagger
 * /api/policies/{id}:
 *   get:
 *     summary: Get a policy by ID
 *     tags: [Policies]
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
 *         description: Policy details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Policy not found
 */
router.get('/:id', verifyToken, policyController.getPolicyById);

/**
 * @swagger
 * /api/policies:
 *   post:
 *     summary: Create a new policy document
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - county_id
 *               - document_type
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               county_id:
 *                 type: string
 *               document_type:
 *                 type: string
 *                 enum: [policy, regulation, report, other]
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Policy uploaded successfully
 *       400:
 *         description: Validation error or no file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', verifyToken, uploadSingle('file'), validate(schemas.policy), policyController.createPolicy);

/**
 * @swagger
 * /api/policies/{id}:
 *   put:
 *     summary: Update a policy document
 *     tags: [Policies]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               county_id:
 *                 type: string
 *               document_type:
 *                 type: string
 *                 enum: [policy, regulation, report, other]
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Policy updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Policy not found
 */
router.put('/:id', verifyToken, uploadSingle('file'), policyController.updatePolicy);

/**
 * @swagger
 * /api/policies/{id}:
 *   delete:
 *     summary: Delete a policy document
 *     tags: [Policies]
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
 *         description: Policy deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Policy not found
 */
router.delete('/:id', verifyToken, policyController.deletePolicy);

/**
 * @swagger
 * /api/policies/search:
 *   get:
 *     summary: Search policies
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: county_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of policies matching the search
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 */
router.get('/search', verifyToken, policyController.searchPolicies);

/**
 * @swagger
 * /api/policies/county/{countyId}:
 *   get:
 *     summary: Get policies by county
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: countyId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: List of policies for the county with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/county/:countyId', verifyToken, policyController.getPoliciesByCounty);

/**
 * @swagger
 * /api/policies/{id}/download:
 *   get:
 *     summary: Download a policy file
 *     tags: [Policies]
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
 *         description: Policy file download
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Policy or file not found
 */
router.get('/:id/download', verifyToken, policyController.downloadPolicy);

module.exports = router;