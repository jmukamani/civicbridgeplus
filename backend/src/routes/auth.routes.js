const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { schemas, validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiting');

router.post('/register', authLimiter, validate(schemas.register), authController.register);
router.post('/login', authLimiter, validate(schemas.login), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/verify-token', authController.verifyToken);
router.post('/refresh-token', authLimiter, authController.refreshToken);

module.exports = router;