const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { verifyToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.get('/', verifyToken, messageController.getMessages);
router.get('/thread/:threadId', verifyToken, messageController.getThread);
router.post('/send', verifyToken, validate(schemas.message), messageController.sendMessage);
router.put('/:id/read', verifyToken, messageController.markAsRead);
router.get('/conversations', verifyToken, messageController.getConversations);
router.delete('/:id', verifyToken, messageController.deleteMessage);
router.get('/search', verifyToken, messageController.searchMessages);
router.get('/stats', verifyToken, messageController.getMessageStats);

module.exports = router;