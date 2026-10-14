const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  keywords: [{ type: String }],
  category: { type: String, default: 'Artificial Intelligence' },
  websiteNiche: { type: String, default: 'Technology & AI' },
  
  // ML & Scoring Metrics
  trendScore: { type: Number, default: 75.0 },
  relevanceScore: { type: Number, default: 0.85 },
  seoOpportunity: { type: Number, default: 80.0 },
  predictedPerformance: { type: Number, default: 78.0 },
  topicPriorityScore: { type: Number, default: 82.0 },
  
  // Metrics breakdown
  searchVolume: { type: Number, default: 5000 },
  searchGrowthPct: { type: Number, default: 35.0 },
  newsFrequency: { type: Number, default: 12 },
  keywordCompetition: { type: Number, default: 0.40 },
  
  reasoning: { type: String, default: '' },
  clusterName: { type: String, default: 'General Tech' },
  
  status: {
    type: String,
    enum: ['discovered', 'recommended', 'approved', 'rejected', 'generating', 'published'],
    default: 'discovered'
  },
  
  discoveredAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Topic', TopicSchema);
