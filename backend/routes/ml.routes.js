const express = require('express');
const router = express.Router();
const mlClient = require('../services/mlClient');
const MLPrediction = require('../models/MLPrediction');
const MLModelMeta = require('../models/MLModelMeta');

// GET /api/ml/models - Model Registry and Metrics Hub
router.get('/models', async (req, res, next) => {
  try {
    const mlMeta = await mlClient.getModelMetadata();
    res.json({ success: true, metadata: mlMeta });
  } catch (err) {
    next(err);
  }
});

// POST /api/ml/retrain - Retrain models on latest data
router.post('/retrain', async (req, res, next) => {
  try {
    const { reason, newCount } = req.body;
    const result = await mlClient.triggerRetraining(reason || 'Dashboard Retraining Trigger', newCount || 100);
    res.json({ success: true, retrainResult: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/ml/predict-publish-time - Optimal publishing time slot
router.post('/predict-publish-time', async (req, res, next) => {
  try {
    const { category, targetAudience } = req.body;
    const result = await mlClient.predictPublishTime({ category, target_audience: targetAudience });
    res.json({ success: true, scheduleRecommendation: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/ml/duplicate-check - Direct duplicate check API
router.post('/duplicate-check', async (req, res, next) => {
  try {
    const { title, content, existingArticles } = req.body;
    const result = await mlClient.detectDuplicate(title, content, existingArticles || []);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
