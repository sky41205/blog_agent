const mongoose = require('mongoose');

const TopicClusterSchema = new mongoose.Schema({
  clusterId: { type: Number, required: true },
  name: { type: String, required: true },
  keywords: [{ type: String }],
  topicsCount: { type: Number, default: 0 },
  avgTrendScore: { type: Number, default: 75.0 },
  topicTitles: [{ type: String }],
  category: { type: String, default: 'General' },
  lastClusteredAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TopicCluster', TopicClusterSchema);
