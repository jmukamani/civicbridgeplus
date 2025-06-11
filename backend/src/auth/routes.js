const express = require('express');
const router = express.Router();
const authController = require('./controller');
const { validateLogin, validateRegister } = require('./validators');
const { authenticate } = require('../middleware/auth');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

module.exports = router;