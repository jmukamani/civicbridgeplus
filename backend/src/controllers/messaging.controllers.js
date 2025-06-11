const { Message, Thread } = require('../models/postgres/message.model');
const { sendSmsNotification } = require('../services/sms.service');
const { sendEmailNotification } = require('../services/email.service');

/**
 * @desc Send a new message or reply to a thread
 * @route POST /api/messages
 * @access Authenticated
 */
const sendMessage = async (req, res) => {
  try {
    const { threadId, recipientId, content } = req.body;
    const senderId = req.user.id;

    // Validate input
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    let thread;
    
    // Create new thread if no threadId provided
    if (!threadId) {
      thread = await Thread.create({
        subject: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        created_by: senderId
      });
      
      // Add participants to thread
      await thread.addParticipants([senderId, recipientId]);
    } else {
      thread = await Thread.findByPk(threadId);
      if (!thread) {
        return res.status(404).json({ message: 'Thread not found' });
      }
    }

    // Create message
    const message = await Message.create({
      thread_id: thread.id,
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      read_status: false
    });

    // Notify recipient
    const recipient = await User.findByPk(recipientId);
    if (recipient) {
      // Send email notification
      await sendEmailNotification({
        to: recipient.email,
        subject: `New message in thread: ${thread.subject}`,
        text: `You have received a new message: ${content.substring(0, 100)}...`
      });

      // Send SMS notification if email not available
      if (!recipient.email && recipient.phone) {
        await sendSmsNotification({
          to: recipient.phone,
          message: `New message: ${content.substring(0, 100)}...`
        });
      }
    }

    res.status(201).json({
      threadId: thread.id,
      messageId: message.id,
      status: 'sent'
    });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

module.exports = {
  sendMessage,
};