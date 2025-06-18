const mongoose = require('mongoose');
const logger = require('../../utils/logger');

const analyticsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  action_type: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'view_policy', 'download_policy', 'send_message', 'view_profile']
  },
  resource_id: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  session_id: {
    type: String,
    required: true
  },
  ip_address: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  geographic_data: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  device_info: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    os: String,
    browser: String,
    user_agent: String
  }
}, {
  timestamps: true
});

// Indexes for faster querying
analyticsSchema.index({ user_id: 1 });
analyticsSchema.index({ action_type: 1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ 'geographic_data.country': 1 });
analyticsSchema.index({ 'device_info.type': 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;