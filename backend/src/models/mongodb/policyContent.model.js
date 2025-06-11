const mongoose = require('mongoose');

const policyVersionSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    required: true
  },
  metadata: {
    title: String,
    author: String,
    keywords: [String],
    entities: [{
      type: String,
      value: String
    }],
    summary: String
  },
  change_reason: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const policyContentSchema = new mongoose.Schema({
  policy_id: {
    type: Number,
    required: true,
    unique: true
  },
  versions: [policyVersionSchema],
  analysis_data: {
    keywords: [String],
    entities: [{
      type: String,
      value: String
    }],
    sentiment: {
      score: Number,
      magnitude: Number
    }
  },
  search_terms: [String]
}, {
  timestamps: true
});

const PolicyContent = mongoose.model('PolicyContent', policyContentSchema);

module.exports = PolicyContent;