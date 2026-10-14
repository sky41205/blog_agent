const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  domain: { type: String, default: '' },
  publicationDate: { type: String, default: '' },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  topicTitle: { type: String, default: '' },
  extractedFacts: [{ type: String }],
  reliabilityScore: { type: Number, default: 0.90 },
  author: { type: String, default: '' },
  rawSnippet: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Source', SourceSchema);
