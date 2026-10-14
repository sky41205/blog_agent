const mongoose = require('mongoose');

const ContentEmbeddingSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  tokens: [{ type: String }],
  snippet: { type: String, default: '' },
  embeddingVector: [{ type: Number }], // Numerical vector or TF-IDF weights
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ContentEmbedding', ContentEmbeddingSchema);
