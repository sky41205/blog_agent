const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const brandVoiceService = require('../services/brandVoiceService');
const webhookService = require('../services/webhookService');

// GET /api/settings - Retrieve global settings
router.get('/', async (req, res, next) => {
  try {
    let setting = null;
    try {
      setting = await Setting.findOne({ key: 'global_config' });
    } catch (e) {}

    if (!setting) {
      setting = {
        key: 'global_config',
        aiProvider: process.env.AI_PROVIDER || 'gemini',
        geminiModel: 'gemini-1.5-pro',
        openaiModel: 'gpt-4o',
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
        hasOpenaiKey: Boolean(process.env.OPENAI_API_KEY),
        googleOAuth: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          projectId: process.env.GOOGLE_PROJECT_ID || 'bolg-agent',
          isConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
        },
        brandVoice: {
          tone: "humanized, authoritative yet conversational",
          formality: "medium",
          paragraphLength: "short (2-4 sentences)",
          style: "educational + practical insights + real-world scenarios",
          ctaStyle: "soft and value-driven",
          targetAudience: "Citizens, Students, Volunteers, and Tech Professionals"
        },
        automationMode: 'APPROVAL',
        cronSchedule: '0 8 * * *',
        isAutoCronActive: true,
        autoPublishMinQualityScore: 85,
        liveWebsite: {
          webhookUrl: 'http://localhost:5000/api/public/webhook-receiver',
          apiKey: 'live_website_secure_token_123',
          autoSyncOnPublish: true
        },
        itlcFoundation: {
          siteUrl: 'https://itlcfoundation.com',
          adminUrl: 'https://itlcfoundation.com/admin',
          webhookUrl: 'https://itlcfoundation.com/api/blogs/receive',
          apiKey: '',
          integrationType: 'webhook',
          wpUsername: '',
          wpAppPassword: '',
          autoPublishEnabled: true,
          lastSyncStatus: 'Ready to connect'
        },
        itlcIndia: {
          siteUrl: 'https://www.itlcindia.com',
          adminUrl: 'https://www.itlcindia.com/admin/blogs',
          webhookUrl: 'https://www.itlcindia.com/api/blogs/receive',
          apiKey: '',
          integrationType: 'webhook',
          wpUsername: '',
          wpAppPassword: '',
          autoPublishEnabled: true,
          lastSyncStatus: 'Ready to connect'
        }
      };
    }

    res.json({ success: true, settings: setting });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings - Update configuration
router.put('/', async (req, res, next) => {
  try {
    const updated = await Setting.findOneAndUpdate(
      { key: 'global_config' },
      { ...req.body },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Settings saved successfully!', settings: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/settings/extract-brand-voice - Analyze corpus for brand voice
router.post('/extract-brand-voice', async (req, res, next) => {
  try {
    const { sampleText } = req.body || {};
    const profile = await brandVoiceService.extractBrandVoiceFromCorpus(sampleText);
    res.json({ success: true, message: 'Brand voice extracted successfully with GenAI!', brandVoice: profile });
  } catch (err) {
    next(err);
  }
});

// POST /api/settings/test-webhook - Test webhook connection to live website
router.post('/test-webhook', async (req, res, next) => {
  try {
    const dummyBlog = {
      id: 'test-preview-123',
      title: 'Autonomous Blogger: Live Website Integration Verification',
      slug: 'test-live-integration-post',
      excerpt: 'This is an automated verification post validating real-time Webhook and REST API sync between the Autonomous Blogger Engine and your Live Website.',
      contentMarkdown: '# Live Website Integration Verified!\n\nYour website is successfully connected to the Autonomous Blogger Engine.',
      category: 'System Integration',
      author: 'AI Autonomous Editor',
      publishedAt: new Date().toISOString()
    };

    const syncResult = await webhookService.dispatchToLiveWebsite(dummyBlog);
    res.json({ success: true, syncResult });
  } catch (err) {
    next(err);
  }
});

// POST /api/settings/test-itlc-connection - Test connection to ITLC Foundation Hub (https://itlcfoundation.com/admin)
router.post('/test-itlc-connection', async (req, res, next) => {
  try {
    const itlcConfig = req.body || {};
    const result = await webhookService.testITLCConnection(itlcConfig);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/settings/test-itlc-india-connection - Test connection to ITLC INDIA PVT LTD (https://www.itlcindia.com/admin/blogs)
router.post('/test-itlc-india-connection', async (req, res, next) => {
  try {
    const itlcIndiaConfig = req.body || {};
    const result = await webhookService.testITLCIndiaConnection(itlcIndiaConfig);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/settings/sync-itlc - Ingest official ITLC topics, articles, and settings
router.post('/sync-itlc', async (req, res, next) => {
  try {
    const itlcSyncService = require('../services/itlcSyncService');
    const result = await itlcSyncService.syncITLCData();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
