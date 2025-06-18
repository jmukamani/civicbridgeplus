const mongoose = require('mongoose');
const logger = require('../../utils/logger');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['system', 'message', 'policy_update', 'announcement', 'reminder']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  scheduled_at: {
    type: Date
  },
  sent_at: {
    type: Date
  },
  delivery_status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  retry_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster querying
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ created_at: -1 });
notificationSchema.index({ delivery_status: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;