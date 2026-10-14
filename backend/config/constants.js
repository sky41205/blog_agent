module.exports = {
  DEFAULT_PORT: 5000,
  DEFAULT_ML_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  JWT_SECRET: process.env.JWT_SECRET || 'autonomous_blogger_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: '7d',
  
  AUTOMATION_MODES: {
    MANUAL: 'MANUAL',       // AI generates -> Human edits -> Publish
    APPROVAL: 'APPROVAL',   // AI generates -> AI checks -> Human approves -> Publish
    AUTOMATIC: 'AUTOMATIC'  // AI generates -> Research -> Quality checks -> ML thresholds -> Auto Publish
  },
  
  BLOG_STATUS: {
    DISCOVERED: 'DISCOVERED',
    DRAFT: 'DRAFT',
    IN_REVIEW: 'IN_REVIEW',
    SCHEDULED: 'SCHEDULED',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED'
  },
  
  AI_PROVIDERS: {
    GEMINI: 'gemini',
    OPENAI: 'openai',
    MOCK: 'mock'
  },
  
  DEFAULT_BRAND_VOICE: {
    tone: "humanized, authoritative yet conversational",
    formality: "medium",
    paragraphLength: "short to medium (2-4 sentences)",
    style: "educational + practical insights + real-world scenarios",
    ctaStyle: "soft and value-driven",
    targetAudience: "Developers, Tech Leads, and AI Enthusiasts",
    vocabulary: "clear, modern industry terminology without corporate buzzwords"
  }
};
