const mongoose = require('mongoose');

const MLPredictionSchema = new mongoose.Schema({
  modelName: {
    type: String,
    enum: ['trend_model', 'topic_relevance_model', 'performance_model', 'publishing_time_model', 'quality_model'],
    required: true
  },
  entityType: { type: String, enum: ['topic', 'blog'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  entityTitle: { type: String, default: '' },
  
  inputFeatures: { type: Object, default: {} },
  predictedValues: { type: Object, default: {} },
  actualOutcome: { type: Object, default: {} },
  
  accuracyScore: { type: Number },
  predictionError: { type: Number },
  evaluatedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('MLPrediction', MLPredictionSchema);
