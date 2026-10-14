const mongoose = require('mongoose');

const BlogAnalyticsSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  blogSlug: { type: String, required: true },
  blogTitle: { type: String, required: true },
  category: { type: String, default: 'General' },
  
  // Interaction metrics
  views: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  avgReadingTimeSeconds: { type: Number, default: 0 },
  avgScrollDepthPct: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  internalLinkClicks: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  bounceRatePct: { type: Number, default: 35.0 },
  
  // Traffic sources
  trafficSources: {
    organicSearch: { type: Number, default: 0 },
    direct: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    referral: { type: Number, default: 0 }
  },
  
  recordedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BlogAnalytics', BlogAnalyticsSchema);
