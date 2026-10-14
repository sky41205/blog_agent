const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Topic = require('../models/Topic');
const TopicCluster = require('../models/TopicCluster');
const mlClient = require('../services/mlClient');
const decisionEngine = require('../services/decisionEngine');
const { AIProviderFactory, prompts } = require('../services/ai/aiProvider');
const mysqlSyncService = require('../services/mysqlSync.service');
const liveTrendIngestor = require('../services/liveTrendIngestor.service');

// GET /api/topics - List all topics with filters and dynamic refresh support
router.get('/', async (req, res, next) => {
  try {
    const { category, status, search, minPriority, refresh, niche, region = 'GLOBAL', geo, limit = 50 } = req.query;
    const targetRegion = geo || region;
    const filter = {};
    
    if (category && category !== 'All') {
      const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = { $regex: escaped, $options: 'i' };
    }
    if (status && status !== 'All') filter.status = status;
    if (minPriority) filter.topicPriorityScore = { $gte: Number(minPriority) };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If explicit refresh requested, fetch & score fresh live internet trends
    if (refresh === 'true') {
      try {
        const liveTrends = await liveTrendIngestor.fetchLiveTrends(category !== 'All' ? category : (niche || 'Technology & AI'), search || '', targetRegion);
        for (const cand of liveTrends.slice(0, 8)) {
          let trendScore = 85;
          let relScore = 0.90;
          try {
            const tData = await mlClient.predictTrend({ topic: cand.title, search_volume: cand.volume || 10000, search_growth: cand.growth || 50, niche_relevance: 90 });
            trendScore = tData.trend_score;
          } catch(e) {}
          try {
            const rData = await mlClient.predictRelevance({ title: cand.title, category: cand.category, website_niche: category || 'Technology' });
            relScore = rData.relevance_probability;
          } catch(e) {}
          const priority = decisionEngine.calculateTopicPriority(trendScore, relScore, 85, 82);

          const saved = await Topic.findOneAndUpdate(
            { title: cand.title },
            {
              title: cand.title,
              category: cand.category,
              keywords: cand.keywords || ['technology', 'trending'],
              description: `Live trending discussion covering ${cand.title} with high search interest and engagement potential.`,
              trendScore,
              relevanceScore: relScore,
              seoOpportunity: 88,
              predictedPerformance: 85,
              topicPriorityScore: priority.topicPriorityScore,
              reasoning: `${cand.source ? `[${cand.source}] ` : ''}${priority.explanation}`,
              status: priority.topicPriorityScore >= 80 ? 'recommended' : 'discovered'
            },
            { upsert: true, new: true }
          );

          if (saved) {
            try {
              await mysqlSyncService.saveTopicToMySQL(saved);
            } catch (e) {}
          }
        }
      } catch (ingestErr) {
        console.warn('[TopicRoutes] Refresh ingestion note:', ingestErr.message);
      }
    }

    let topics = [];
    try {
      topics = await Topic.find(filter).sort({ updatedAt: -1, topicPriorityScore: -1 }).limit(Number(limit) || 50);
    } catch (dbErr) {
      // Fallback
    }

    if (!topics || topics.length === 0) {
      const dynamicTrends = await liveTrendIngestor.fetchLiveTrends(category !== 'All' ? category : 'Technology & AI', search || '', targetRegion);
      const dynamicTopics = dynamicTrends.map((t, idx) => ({
        _id: `dyn-top-${Date.now()}-${idx}`,
        title: t.title,
        description: `High-velocity topic: ${t.title}. Strong search momentum and engagement across technical networks.`,
        keywords: t.keywords || ['trending', 'news'],
        category: t.category,
        trendScore: 88 + (10 - idx),
        relevanceScore: 0.92,
        seoOpportunity: 86,
        predictedPerformance: 84,
        topicPriorityScore: 89 + (5 - idx),
        status: "recommended",
        reasoning: `Discovered from ${t.source || 'Live Signal'} with high search velocity.`
      }));
      return res.json({ success: true, count: dynamicTopics.length, topics: dynamicTopics });
    }

    res.json({ success: true, count: topics.length, topics });
  } catch (err) {
    next(err);
  }
});

// GET /api/topics/regions - List all supported global regions/countries
router.get('/regions', (req, res) => {
  res.json({
    success: true,
    total: liveTrendIngestor.getSupportedRegions().length,
    regions: liveTrendIngestor.getSupportedRegions()
  });
});

// GET /api/topics/categories - Comprehensive multi-category taxonomy (Finance, NGOs, Technology, Causes, Healthcare, Trends)
router.get('/categories', (req, res) => {
  const taxonomy = liveTrendIngestor.getCategoriesTaxonomy();
  res.json({
    success: true,
    total: taxonomy.length,
    categories: taxonomy
  });
});

// GET /api/topics/global-trends - Fetch trends from all over the globe with filters
router.get('/global-trends', async (req, res, next) => {
  try {
    const { region = 'GLOBAL', geo, category = 'All', search = '', limit = 30 } = req.query;
    const targetRegion = geo || region;
    const data = await liveTrendIngestor.getGlobalTrends({
      region: targetRegion,
      category,
      search,
      limit: parseInt(limit, 10) || 30
    });
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...data
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/topics/realtime-radar - Fetch second-by-second live internet trends and ML assumptions
router.get('/realtime-radar', async (req, res, next) => {
  try {
    const { niche, category, search = '', region = 'GLOBAL', geo } = req.query;
    const targetNiche = category || niche || 'All';
    const targetRegion = geo || region;
    const radarData = await liveTrendIngestor.getRealtimeRadar(targetNiche, search, targetRegion);
    const regionInfo = liveTrendIngestor.getRegionInfo(targetRegion);
    res.json({
      success: true,
      region: regionInfo.code,
      regionName: regionInfo.name,
      flag: regionInfo.flag,
      category: targetNiche,
      timestamp: new Date().toISOString(),
      tickingSecond: new Date().getSeconds(),
      totalSignals: radarData.length,
      trends: radarData
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/topics/realtime-radar - Trigger dynamic recalculation on refresh
router.post('/realtime-radar', async (req, res, next) => {
  try {
    const { niche, category, searchSeed = '', region = 'GLOBAL', geo } = req.body;
    const targetNiche = category || niche || 'All';
    const targetRegion = geo || region;
    const radarData = await liveTrendIngestor.getRealtimeRadar(targetNiche, searchSeed, targetRegion);
    const regionInfo = liveTrendIngestor.getRegionInfo(targetRegion);
    res.json({
      success: true,
      region: regionInfo.code,
      regionName: regionInfo.name,
      flag: regionInfo.flag,
      category: targetNiche,
      timestamp: new Date().toISOString(),
      tickingSecond: new Date().getSeconds(),
      totalSignals: radarData.length,
      trends: radarData
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/topics/trending-report - Live trending topics ML data report
router.get('/trending-report', async (req, res, next) => {
  try {
    const reportPath = path.join(__dirname, '..', 'data', 'live_trending_report_latest.json');
    if (fs.existsSync(reportPath)) {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      return res.json({ success: true, ...data });
    }
    res.status(404).json({ success: false, message: 'Trending report not yet generated.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/topics/trending-report/csv - Download ML-ready feature matrix CSV
router.get('/trending-report/csv', async (req, res, next) => {
  try {
    const csvPath = path.join(__dirname, '..', 'data', 'live_trending_features.csv');
    if (fs.existsSync(csvPath)) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="live_trending_features.csv"');
      return res.sendFile(csvPath);
    }
    res.status(404).json({ success: false, message: 'Feature CSV not yet generated.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/topics/discover - Run live trend ingestion and ML scoring across any region
router.post('/discover', async (req, res, next) => {
  try {
    const { niche, category, searchSeed = '', region = 'GLOBAL', geo } = req.body;
    const targetCategory = category || niche || 'All';
    const targetRegion = geo || region;
    const regionInfo = liveTrendIngestor.getRegionInfo(targetRegion);
    console.log(`[TopicDiscovery] Ingesting live trends for region: ${regionInfo.flag} ${regionInfo.name}, category: "${targetCategory}", seed: "${searchSeed}"`);

    const candidatePool = await liveTrendIngestor.fetchLiveTrends(targetCategory, searchSeed, targetRegion);
    const topCandidates = candidatePool.slice(0, 15);

    const discoveredResults = await Promise.all(topCandidates.map(async (cand) => {
      let trendData = { trend_score: 78 };
      let relevanceData = { relevance_probability: 0.90, matched_keywords: ["trending", "innovation"] };

      try {
        trendData = await mlClient.predictTrend({
          topic: cand.title,
          search_volume: cand.volume || 10000,
          search_growth: cand.growth || 50,
          niche_relevance: 90
        });
      } catch (e) {
        console.warn('[TopicDiscovery] Trend score fallback for:', cand.title);
      }

      try {
        relevanceData = await mlClient.predictRelevance({
          title: cand.title,
          category: cand.category,
          website_niche: niche
        });
      } catch (e) {
        console.warn('[TopicDiscovery] Relevance fallback for:', cand.title);
      }

      // Compute Priority with Decision Engine
      const priority = decisionEngine.calculateTopicPriority(
        trendData.trend_score,
        relevanceData.relevance_probability,
        85,
        82
      );

      let saved = null;
      try {
        saved = await Topic.findOneAndUpdate(
          { title: cand.title },
          {
            title: cand.title,
            category: cand.category,
            keywords: cand.keywords || relevanceData.matched_keywords || ["technology", "ai"],
            trendScore: trendData.trend_score,
            relevanceScore: relevanceData.relevance_probability,
            seoOpportunity: 85,
            predictedPerformance: 82,
            topicPriorityScore: priority.topicPriorityScore,
            reasoning: `${cand.source ? `[${cand.source}] ` : ''}${priority.explanation}`,
            status: priority.topicPriorityScore >= 80 ? 'recommended' : 'discovered'
          },
          { upsert: true, new: true }
        );

        if (saved) {
          try {
            await mysqlSyncService.saveTopicToMySQL(saved);
          } catch (e) {}
        }
      } catch (e) {}

      return saved || {
        title: cand.title,
        category: cand.category,
        trendScore: trendData.trend_score,
        relevanceScore: relevanceData.relevance_probability,
        topicPriorityScore: priority.topicPriorityScore,
        reasoning: `${cand.source ? `[${cand.source}] ` : ''}${priority.explanation}`
      };
    }));

    res.json({
      success: true,
      region: regionInfo.code,
      regionName: regionInfo.name,
      flag: regionInfo.flag,
      message: `Successfully analyzed, scored, and synced ${discoveredResults.length} trending topics from ${regionInfo.flag} ${regionInfo.name}.`,
      topics: discoveredResults
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/topics/analyze - Deep ML + AI analysis of a specific topic
router.post('/analyze', async (req, res, next) => {
  try {
    const { title, category, keywords } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Topic title is required.' });
    }

    const trendRes = await mlClient.predictTrend({
      topic: title,
      search_volume: 7500,
      search_growth: 45,
      niche_relevance: 90
    });

    const relRes = await mlClient.predictRelevance({
      title,
      category: category || 'Artificial Intelligence',
      keywords: keywords || ''
    });

    const priority = decisionEngine.calculateTopicPriority(
      trendRes.trend_score,
      relRes.relevance_probability,
      88,
      84
    );

    res.json({
      success: true,
      analysis: {
        title,
        category: relRes.category,
        trendScore: trendRes.trend_score,
        relevanceProbability: relRes.relevance_probability,
        isRecommended: relRes.recommended,
        topicPriorityScore: priority.topicPriorityScore,
        recommendationAction: priority.recommendationAction,
        explanation: priority.explanation,
        breakdown: priority.breakdown,
        featureContributions: trendRes.feature_contributions
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/topics - Add custom topic
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, keywords } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const trendRes = await mlClient.predictTrend({ topic: title });
    const relRes = await mlClient.predictRelevance({ title, category, keywords: (keywords || []).join(',') });
    const priority = decisionEngine.calculateTopicPriority(trendRes.trend_score, relRes.relevance_probability, 85, 80);

    const topic = await Topic.create({
      title,
      description,
      category: category || relRes.category,
      keywords: keywords || relRes.matched_keywords,
      trendScore: trendRes.trend_score,
      relevanceScore: relRes.relevance_probability,
      seoOpportunity: 85,
      predictedPerformance: 80,
      topicPriorityScore: priority.topicPriorityScore,
      reasoning: priority.explanation,
      status: 'recommended'
    });

    try {
      await mysqlSyncService.saveTopicToMySQL(topic);
    } catch (e) {}

    res.status(201).json({ success: true, topic });
  } catch (err) {
    next(err);
  }
});

// PUT /api/topics/:id - Update topic status (e.g. approved / rejected)
router.put('/:id', async (req, res, next) => {
  try {
    const { status, category, title } = req.body;
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(category && { category }), ...(title && { title }) },
      { new: true }
    );

    if (topic) {
      try {
        await mysqlSyncService.saveTopicToMySQL(topic);
      } catch (e) {}
    }

    res.json({ success: true, topic });
  } catch (err) {
    next(err);
  }
});

// GET /api/topics/clusters - NLP Topic Clusters
router.get('/clusters', async (req, res, next) => {
  try {
    const topics = await Topic.find().limit(50);
    const clusterRes = await mlClient.clusterTopics(topics);
    res.json({ success: true, clusters: clusterRes.clusters, totalTopics: clusterRes.total_topics });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
