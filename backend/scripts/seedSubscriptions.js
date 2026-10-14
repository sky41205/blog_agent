const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Subscription = require('../models/Subscription');
const { SUBSCRIPTION_PLANS } = require('../config/subscriptionPlans');

async function seedSubscriptions() {
  try {
    await connectDB();
    console.log('[Seed] Connected to database for subscription initialization...');

    const existingCount = await Subscription.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed] Subscriptions already exist (${existingCount} records). Verifying active demo keys...`);
    }

    const demoSubscriptions = [
      {
        key: 'blg_test_demo_free_developer_2026',
        clientName: 'Local Developer Playground',
        websiteUrl: 'http://localhost:3001',
        ownerEmail: 'developer@autonomousblogger.local',
        plan: 'free',
        status: 'active',
        billingCycle: 'monthly',
        currency: 'USD',
        pricePaid: 0,
        quotas: SUBSCRIPTION_PLANS.free.quotas,
        usage: {
          requestsThisPeriod: 42,
          generationsThisPeriod: 2,
          totalRequestsAllTime: 180,
          totalGenerationsAllTime: 12,
          lastUsedAt: new Date()
        },
        allowedDomains: ['localhost', '127.0.0.1'],
        webhookUrl: 'http://localhost:5000/api/public/webhook-receiver',
        customBrandVoice: 'Pragmatic, authoritative, engineering-focused technical writing',
        notes: 'Pre-configured sandbox key for instant local testing and widget embedding'
      },
      {
        key: 'blg_live_techhorizon_pro_89a3f2',
        clientName: 'TechHorizon Media & Labs',
        websiteUrl: 'https://techhorizon.io',
        ownerEmail: 'editor@techhorizon.io',
        plan: 'pro',
        status: 'active',
        billingCycle: 'monthly',
        currency: 'USD',
        pricePaid: 79,
        quotas: SUBSCRIPTION_PLANS.pro.quotas,
        usage: {
          requestsThisPeriod: 1420,
          generationsThisPeriod: 28,
          totalRequestsAllTime: 9850,
          totalGenerationsAllTime: 184,
          lastUsedAt: new Date(Date.now() - 1000 * 60 * 35)
        },
        allowedDomains: ['techhorizon.io', 'localhost'],
        webhookUrl: 'https://techhorizon.io/api/webhooks/blogger-ingest',
        customBrandVoice: 'Silicon Valley insider, pragmatic architecture, in-depth benchmarks',
        notes: 'Paying Pro client on monthly auto-debit'
      },
      {
        key: 'blg_live_cloudmatrix_ent_99c4d1',
        clientName: 'CloudMatrix Global Media Corp',
        websiteUrl: 'https://cloudmatrix.dev',
        ownerEmail: 'infrastructure@cloudmatrix.dev',
        plan: 'enterprise',
        status: 'active',
        billingCycle: 'yearly',
        currency: 'USD',
        pricePaid: 2490,
        quotas: SUBSCRIPTION_PLANS.enterprise.quotas,
        usage: {
          requestsThisPeriod: 14850,
          generationsThisPeriod: 215,
          totalRequestsAllTime: 82400,
          totalGenerationsAllTime: 1120,
          lastUsedAt: new Date(Date.now() - 1000 * 60 * 12)
        },
        allowedDomains: ['cloudmatrix.dev', 'api.cloudmatrix.dev', 'localhost'],
        webhookUrl: 'https://cloudmatrix.dev/webhooks/articles',
        customBrandVoice: 'Enterprise CIO & VP Engineering tone, Fortune 500 cloud architectures',
        notes: 'Enterprise annual contract with dedicated Vertex AI SLA'
      },
      {
        key: 'blg_live_fintechpulse_start_11b2e3',
        clientName: 'FinTech Pulse India',
        websiteUrl: 'https://fintechpulse.in',
        ownerEmail: 'news@fintechpulse.in',
        plan: 'starter',
        status: 'active',
        billingCycle: 'monthly',
        currency: 'INR',
        pricePaid: 2499,
        quotas: SUBSCRIPTION_PLANS.starter.quotas,
        usage: {
          requestsThisPeriod: 640,
          generationsThisPeriod: 14,
          totalRequestsAllTime: 3410,
          totalGenerationsAllTime: 52,
          lastUsedAt: new Date(Date.now() - 1000 * 60 * 120)
        },
        allowedDomains: ['fintechpulse.in', 'localhost'],
        webhookUrl: 'https://fintechpulse.in/api/incoming-posts',
        customBrandVoice: 'Indian BFSI & FinTech ecosystem analysis, RBI compliance insights',
        notes: 'Starter plan subscriber'
      }
    ];

    for (const subData of demoSubscriptions) {
      const exists = await Subscription.findOne({ key: subData.key });
      if (!exists) {
        await Subscription.create(subData);
        console.log(`[Seed] Created subscription for "${subData.clientName}" (${subData.plan.toUpperCase()})`);
      } else {
        console.log(`[Seed] Subscription for "${subData.clientName}" already exists.`);
      }
    }

    console.log('[Seed] Subscriptions successfully initialized!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

seedSubscriptions();
