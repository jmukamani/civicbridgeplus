const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  replies: [{
    text: String,
    userId: Number,
    timestamp: { type: Date, default: Date.now },
  }],
});

const feedbackSchema = new mongoose.Schema({
  policyId: { type: Number, required: true },
  userId: { type: Number, required: true },
  comments: [commentSchema],
  sentimentAnalysis: {
    overall: { type: String, enum: ['positive', 'negative', 'neutral'] },
    confidence: { type: Number, min: 0, max: 1 },
  },
  rating: { type: Number, min: 1, max: 5 },
  isPublic: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Feedback', feedbackSchema);