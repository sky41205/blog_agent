/**
 * Subscription Plans & Tier Limits Configuration
 * Provides pricing in both USD and INR, request quotas, generation limits, and features.
 */
const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free Developer',
    description: 'Perfect for prototyping, testing API feeds, and personal side projects.',
    priceMonthlyUSD: 0,
    priceMonthlyINR: 0,
    priceYearlyUSD: 0,
    priceYearlyINR: 0,
    quotas: {
      monthlyRequests: 200,
      monthlyGenerations: 5,
      rateLimitPerMin: 20
    },
    features: [
      '200 REST API Requests / month',
      '5 Full Blog Generations / month',
      'Public Blog Feed & Topic Ingestion',
      'Standard Readability & Quality Scoring',
      'Drop-in Website Embed Widget',
      'Community Support'
    ],
    badgeColor: 'slate',
    popular: false
  },
  starter: {
    id: 'starter',
    name: 'Starter Publisher',
    description: 'Ideal for independent blogs, niche sites, and emerging media publishers.',
    priceMonthlyUSD: 29,
    priceMonthlyINR: 2499,
    priceYearlyUSD: 290,
    priceYearlyINR: 24990,
    quotas: {
      monthlyRequests: 2500,
      monthlyGenerations: 30,
      rateLimitPerMin: 60
    },
    features: [
      '2,500 REST API Requests / month',
      '30 Full Blog Generations / month',
      'Automated Grounded Research with Citations',
      'SEO Metas & Schema.org JSON-LD Markup',
      'Real-Time Webhook Article Push',
      'Full API Access to Headless CMS',
      'Standard Email Support (24h response)'
    ],
    badgeColor: 'blue',
    popular: false
  },
  pro: {
    id: 'pro',
    name: 'Pro Business / Agency',
    description: 'For growing digital agencies, high-traffic SaaS blogs, and multi-author portals.',
    priceMonthlyUSD: 79,
    priceMonthlyINR: 6499,
    priceYearlyUSD: 790,
    priceYearlyINR: 64990,
    quotas: {
      monthlyRequests: 15000,
      monthlyGenerations: 150,
      rateLimitPerMin: 180
    },
    features: [
      '15,000 REST API Requests / month',
      '150 Full Blog Generations / month',
      'Google Cloud Vertex AI Credits Engine (Gemini 2.5 Flash)',
      'Grounded Fact-Auditor with Live Web Redirects',
      'Hasselblad Photoreal Studio Image Directing',
      'Real-Time Viral Signal Radar & Momentum Ingestion',
      'Custom Brand Voice & Author Profile Tuning',
      'Instant Live Webhook Dispatch to Client Servers',
      'Priority Technical Support'
    ],
    badgeColor: 'indigo',
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Scale',
    description: 'For high-volume media houses, multinational networks, and high-frequency publishing.',
    priceMonthlyUSD: 249,
    priceMonthlyINR: 19999,
    priceYearlyUSD: 2490,
    priceYearlyINR: 199990,
    quotas: {
      monthlyRequests: 100000,
      monthlyGenerations: 1000,
      rateLimitPerMin: 600
    },
    features: [
      '100,000 REST API Requests / month',
      '1,000 Full Blog Generations / month',
      'Dedicated Vertex AI Infrastructure Quota',
      'Zero Throttling & High-Priority Concurrency',
      'Multi-Domain CORS Whitelisting',
      'Custom Webhook HMAC Signature Verification',
      'White-label Attribution & Full CMS Re-publishing Rights',
      '99.9% Uptime Service Level Agreement (SLA)',
      'Dedicated Slack / WhatsApp Channel & Solution Engineer'
    ],
    badgeColor: 'purple',
    popular: false
  }
};

module.exports = {
  SUBSCRIPTION_PLANS,
  DEFAULT_PLAN: 'free'
};
