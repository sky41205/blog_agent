const mongoose = require('mongoose');

const MLModelMetaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  algorithm: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  status: { type: String, enum: ['production', 'staging', 'training', 'deprecated'], default: 'production' },
  datasetSize: { type: Number, default: 1000 },
  metrics: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1: Number,
    mae: Number,
    rmse: Number,
    r2: Number
  },
  featureImportances: { type: Object, default: {} },
  lastTrainedAt: { type: Date, default: Date.now },
  trainingDurationSecs: { type: Number, default: 2.5 }
}, { timestamps: true });

module.exports = mongoose.model('MLModelMeta', MLModelMetaSchema);
