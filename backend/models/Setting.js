const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_config' },
  
  // AI Settings
  aiProvider: { type: String, enum: ['gemini', 'openai', 'mock'], default: 'gemini' },
  geminiApiKey: { type: String, default: '' },
  geminiApiKeys: [{ type: String, default: [] }],
  geminiModel: { type: String, default: 'gemini-1.5-flash' },
  openaiApiKey: { type: String, default: '' },
  openaiModel: { type: String, default: 'gpt-4o' },
  searchApiKey: { type: String, default: '' },
  
  // Google Cloud & OAuth 2.0 Credentials
  googleOAuth: {
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' },
    projectId: { type: String, default: 'bolg-agent' },
    isConfigured: { type: Boolean, default: false }
  },
  
  // Brand Voice Profile
  brandVoice: {
    tone: { type: String, default: 'humanized, engaging and authoritative' },
    formality: { type: String, default: 'medium' },
    paragraphLength: { type: String, default: 'short (2-4 sentences)' },
    style: { type: String, default: 'educational + real-world practical scenarios' },
    ctaStyle: { type: String, default: 'soft, value-driven' },
    targetAudience: { type: String, default: 'Developers & Tech Leaders' },
    commonTerminology: [{ type: String, default: ['production-grade', 'scalability', 'best practices', 'benchmarks'] }]
  },
  
  // Autonomous Workflow Config
  automationMode: {
    type: String,
    enum: ['MANUAL', 'APPROVAL', 'AUTOMATIC'],
    default: 'APPROVAL'
  },
  cronSchedule: { type: String, default: '0 8 * * *' }, // Daily at 08:00
  isAutoCronActive: { type: Boolean, default: true },
  autoPublishMinQualityScore: { type: Number, default: 85 },
  maxDailyAutoBlogs: { type: Number, default: 2 },
  
  // Live Website Webhook Integration
  liveWebsite: {
    webhookUrl: { type: String, default: 'http://localhost:5000/api/public/webhook-receiver' },
    apiKey: { type: String, default: 'blogger_live_secret_token_12345' },
    autoSyncOnPublish: { type: Boolean, default: true },
    customHeaders: { type: Object, default: {} }
  },

  // 1. ITLC Foundation Hub Integration (https://itlcfoundation.com/admin)
  itlcFoundation: {
    siteUrl: { type: String, default: 'https://itlcfoundation.com' },
    adminUrl: { type: String, default: 'https://itlcfoundation.com/admin' },
    webhookUrl: { type: String, default: 'https://itlcfoundation.com/api/blogs/receive' },
    apiKey: { type: String, default: '' },
    integrationType: { type: String, enum: ['webhook', 'wordpress', 'rest_api'], default: 'webhook' },
    wpUsername: { type: String, default: '' },
    wpAppPassword: { type: String, default: '' },
    autoPublishEnabled: { type: Boolean, default: true },
    lastSyncStatus: { type: String, default: 'Ready to connect' },
    lastSyncedAt: { type: Date }
  },

  // 2. ITLC INDIA PVT LTD Integration (https://www.itlcindia.com/admin/blogs)
  itlcIndia: {
    siteUrl: { type: String, default: 'https://www.itlcindia.com' },
    adminUrl: { type: String, default: 'https://www.itlcindia.com/admin/blogs' },
    webhookUrl: { type: String, default: 'https://www.itlcindia.com/api/blogs/receive' },
    apiKey: { type: String, default: '' },
    integrationType: { type: String, enum: ['webhook', 'wordpress', 'rest_api'], default: 'webhook' },
    wpUsername: { type: String, default: '' },
    wpAppPassword: { type: String, default: '' },
    autoPublishEnabled: { type: Boolean, default: true },
    lastSyncStatus: { type: String, default: 'Ready to connect' },
    lastSyncedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
