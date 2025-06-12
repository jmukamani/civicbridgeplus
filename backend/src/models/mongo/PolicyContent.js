const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  content: { type: String, required: true },
  changes: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Number, required: true }, // User ID from PostgreSQL
});

const policyContentSchema = new mongoose.Schema({
  policyId: { type: Number, required: true, unique: true }, // Policy ID from PostgreSQL
  versions: [versionSchema],
  analysisData: {
    keywords: [String],
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] },
    complexity: { type: String, enum: ['low', 'medium', 'high'] },
    readabilityScore: Number,
  },
  metadata: {
    wordCount: Number,
    pageCount: Number,
    fileType: String,
    fileSize: Number,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PolicyContent', policyContentSchema);
