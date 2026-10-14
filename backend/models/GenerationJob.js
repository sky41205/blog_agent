const mongoose = require('mongoose');

const GenerationJobSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  topicTitle: { type: String, required: true },
  
  status: {
    type: String,
    enum: ['pending', 'researching', 'generating', 'optimizing_seo', 'quality_check', 'completed', 'failed'],
    default: 'pending'
  },
  
  currentStep: { type: String, default: 'Initialized' },
  progressPct: { type: Number, default: 0 },
  
  logs: [{
    step: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  resultBlogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  resultBlogSlug: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  
  generationConfig: {
    wordCount: { type: Number, default: 1200 },
    tone: { type: String, default: 'Humanized Educational' },
    targetAudience: { type: String, default: 'Tech Enthusiasts' },
    includeFaq: { type: Boolean, default: true },
    includeCodeSnippets: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('GenerationJob', GenerationJobSchema);
