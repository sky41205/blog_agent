const express = require('express');
const router = express.Router();
const axios = require('axios');
const Subscription = require('../models/Subscription');
const { SUBSCRIPTION_PLANS } = require('../config/subscriptionPlans');
const subscriptionDocsService = require('../services/subscriptionDocs.service');

/**
 * GET /api/subscriptions/overview
 * High-level SaaS monetization analytics (MRR, active clients, quota usage)
 */
router.get('/overview', async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });

    let mrrUSD = 0;
    let mrrINR = 0;
    let activeSubscribers = 0;
    let paidSubscribers = 0;
    let totalRequestsServed = 0;
    let totalGenerationsExecuted = 0;

    const planBreakdown = {
      free: 0,
      starter: 0,
      pro: 0,
      enterprise: 0
    };

    subscriptions.forEach(sub => {
      const planCfg = SUBSCRIPTION_PLANS[sub.plan] || SUBSCRIPTION_PLANS.free;
      if (sub.status === 'active') {
        activeSubscribers++;
        if (sub.plan !== 'free') {
          paidSubscribers++;
          mrrUSD += planCfg.priceMonthlyUSD;
          mrrINR += planCfg.priceMonthlyINR;
        }
      }
      if (planBreakdown[sub.plan] !== undefined) {
        planBreakdown[sub.plan]++;
      }
      totalRequestsServed += sub.usage?.totalRequestsAllTime || 0;
      totalGenerationsExecuted += sub.usage?.totalGenerationsAllTime || 0;
    });

    res.json({
      success: true,
      metrics: {
        mrrUSD,
        mrrINR,
        annualRunRateUSD: mrrUSD * 12,
        annualRunRateINR: mrrINR * 12,
        totalWebsites: subscriptions.length,
        activeSubscribers,
        paidSubscribers,
        totalRequestsServed,
        totalGenerationsExecuted,
        planBreakdown
      },
      recentSubscriptions: subscriptions.slice(0, 5)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/subscriptions/plans
 * Available subscription plans, limits, and pricing
 */
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: Object.values(SUBSCRIPTION_PLANS)
  });
});

/**
 * GET /api/subscriptions/keys
 * List all issued subscription keys with pagination & search
 */
router.get('/keys', async (req, res, next) => {
  try {
    const { search, plan, status } = req.query;
    const filter = {};

    if (plan && plan !== 'all') filter.plan = plan;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { websiteUrl: { $regex: search, $options: 'i' } },
        { ownerEmail: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } }
      ];
    }

    const subscriptions = await Subscription.find(filter).sort({ createdAt: -1 });

    const formatted = subscriptions.map(sub => {
      const planCfg = SUBSCRIPTION_PLANS[sub.plan] || SUBSCRIPTION_PLANS.free;
      const reqUsed = sub.usage.requestsThisPeriod || 0;
      const reqLimit = sub.quotas.monthlyRequests || 1;
      const genUsed = sub.usage.generationsThisPeriod || 0;
      const genLimit = sub.quotas.monthlyGenerations || 1;

      return {
        id: sub._id,
        key: sub.key,
        maskedKey: sub.key.substring(0, 10) + '...' + sub.key.slice(-4),
        clientName: sub.clientName,
        websiteUrl: sub.websiteUrl,
        ownerEmail: sub.ownerEmail,
        plan: sub.plan,
        planName: planCfg.name,
        priceMonthlyUSD: planCfg.priceMonthlyUSD,
        priceMonthlyINR: planCfg.priceMonthlyINR,
        status: sub.status,
        billingCycle: sub.billingCycle,
        currency: sub.currency,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        daysRemaining: Math.max(0, Math.ceil((new Date(sub.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))),
        quotas: sub.quotas,
        usage: sub.usage,
        requestsPercentUsed: Math.min(100, Math.round((reqUsed / reqLimit) * 100)),
        generationsPercentUsed: Math.min(100, Math.round((genUsed / genLimit) * 100)),
        webhookUrl: sub.webhookUrl,
        allowedDomains: sub.allowedDomains,
        customBrandVoice: sub.customBrandVoice,
        createdAt: sub.createdAt
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      keys: formatted
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/subscriptions/keys
 * Create a new API key & subscription for a website
 */
router.post('/keys', async (req, res, next) => {
  try {
    const {
      clientName,
      websiteUrl,
      ownerEmail,
      plan = 'free',
      billingCycle = 'monthly',
      currency = 'USD',
      webhookUrl = '',
      allowedDomains = [],
      customBrandVoice
    } = req.body;

    if (!clientName || !websiteUrl || !ownerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Client name, website URL, and owner email are required.'
      });
    }

    const planConfig = SUBSCRIPTION_PLANS[plan] || SUBSCRIPTION_PLANS.free;
    const newKey = Subscription.generateKeyString(plan === 'free' ? 'test' : 'live');

    const subscription = new Subscription({
      key: newKey,
      clientName: clientName.trim(),
      websiteUrl: websiteUrl.trim(),
      ownerEmail: ownerEmail.trim().toLowerCase(),
      plan: planConfig.id,
      status: 'active',
      billingCycle,
      currency,
      pricePaid: currency === 'INR' ? planConfig.priceMonthlyINR : planConfig.priceMonthlyUSD,
      quotas: {
        monthlyRequests: planConfig.quotas.monthlyRequests,
        monthlyGenerations: planConfig.quotas.monthlyGenerations,
        rateLimitPerMin: planConfig.quotas.rateLimitPerMin
      },
      allowedDomains: Array.isArray(allowedDomains) ? allowedDomains : (allowedDomains ? [allowedDomains] : []),
      webhookUrl: webhookUrl.trim(),
      customBrandVoice: customBrandVoice || 'Authoritative, engaging, industry-grade technical journalism'
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: `Subscription API key created for ${subscription.clientName} on ${planConfig.name}! Documentation and integration kit generated.`,
      subscription: {
        id: subscription._id,
        key: subscription.key,
        clientName: subscription.clientName,
        websiteUrl: subscription.websiteUrl,
        plan: subscription.plan,
        quotas: subscription.quotas,
        currentPeriodEnd: subscription.currentPeriodEnd
      },
      documentation: {
        ready: true,
        docsApiUrl: `/api/subscriptions/keys/${subscription._id}/docs`,
        previewUrl: `/api/subscriptions/keys/${subscription._id}/docs/preview`,
        downloadMarkdownUrl: `/api/subscriptions/keys/${subscription._id}/docs/download?format=markdown`,
        downloadHtmlUrl: `/api/subscriptions/keys/${subscription._id}/docs/download?format=html`
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/subscriptions/keys/:id/plan
 * Upgrade or change subscription plan (Free -> Starter -> Pro -> Enterprise)
 */
router.patch('/keys/:id/plan', async (req, res, next) => {
  try {
    const { plan, billingCycle, currency } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const targetPlan = SUBSCRIPTION_PLANS[plan];
    if (!targetPlan) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected.' });
    }

    subscription.applyPlanQuotas(targetPlan.id);
    if (billingCycle) subscription.billingCycle = billingCycle;
    if (currency) subscription.currency = currency;

    subscription.pricePaid = subscription.currency === 'INR' ? targetPlan.priceMonthlyINR : targetPlan.priceMonthlyUSD;
    subscription.status = 'active';

    // Extend period if upgrading
    const now = new Date();
    subscription.currentPeriodStart = now;
    const daysToAdd = subscription.billingCycle === 'yearly' ? 365 : 30;
    subscription.currentPeriodEnd = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    await subscription.save();

    res.json({
      success: true,
      message: `Successfully upgraded ${subscription.clientName} to ${targetPlan.name}!`,
      subscription
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/subscriptions/keys/:id/simulate-payment
 * Simulates Stripe / Razorpay checkout & generates immediate invoice receipt
 */
router.post('/keys/:id/simulate-payment', async (req, res, next) => {
  try {
    const { plan, paymentMethod = 'Stripe Card (simulated)', currency } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const targetPlan = SUBSCRIPTION_PLANS[plan || subscription.plan] || SUBSCRIPTION_PLANS.pro;
    const effectiveCurrency = currency || subscription.currency || 'USD';
    const amount = effectiveCurrency === 'INR' ? targetPlan.priceMonthlyINR : targetPlan.priceMonthlyUSD;

    subscription.applyPlanQuotas(targetPlan.id);
    subscription.status = 'active';
    subscription.currency = effectiveCurrency;
    subscription.pricePaid = amount;

    // Reset period and quotas
    const now = new Date();
    subscription.currentPeriodStart = now;
    const daysToAdd = subscription.billingCycle === 'yearly' ? 365 : 30;
    subscription.currentPeriodEnd = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    subscription.usage.requestsThisPeriod = 0;
    subscription.usage.generationsThisPeriod = 0;

    await subscription.save();

    const invoiceId = 'inv_' + Math.random().toString(36).substring(2, 9).toUpperCase();

    res.json({
      success: true,
      message: `Payment of ${effectiveCurrency === 'INR' ? '₹' : '$'}${amount} processed successfully! Plan activated.`,
      receipt: {
        invoiceId,
        paymentStatus: 'PAID',
        paymentMethod,
        clientName: subscription.clientName,
        plan: targetPlan.name,
        amount,
        currency: effectiveCurrency,
        paidAt: new Date().toISOString(),
        validUntil: subscription.currentPeriodEnd,
        quotasUnlocked: targetPlan.quotas
      },
      subscription
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/subscriptions/keys/:id/regenerate
 * Rolls a fresh API key string
 */
router.post('/keys/:id/regenerate', async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const newKey = Subscription.generateKeyString(subscription.plan === 'free' ? 'test' : 'live');
    subscription.key = newKey;
    await subscription.save();

    res.json({
      success: true,
      message: 'API key regenerated successfully!',
      newKey: subscription.key
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/subscriptions/keys/:id/status
 * Toggle status between active, paused, revoked
 */
router.patch('/keys/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'revoked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    subscription.status = status;
    await subscription.save();

    res.json({
      success: true,
      message: `Subscription status updated to "${status}".`,
      subscription
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/subscriptions/keys/:id/reset-usage
 * Resets monthly usage counters
 */
router.post('/keys/:id/reset-usage', async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    subscription.usage.requestsThisPeriod = 0;
    subscription.usage.generationsThisPeriod = 0;
    await subscription.save();

    res.json({
      success: true,
      message: 'Monthly usage counters reset to 0.',
      subscription
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/subscriptions/keys/:id/test-webhook
 * Dispatches test webhook payload to client's configured endpoint
 */
router.post('/keys/:id/test-webhook', async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (!subscription.webhookUrl) {
      return res.status(400).json({ success: false, message: 'No webhook URL configured for this subscription.' });
    }

    const testPayload = {
      event: 'subscription.test_ping',
      timestamp: new Date().toISOString(),
      clientName: subscription.clientName,
      websiteUrl: subscription.websiteUrl,
      plan: subscription.plan,
      testData: {
        message: 'This is a test notification from Autonomous Blogger Subscription API.',
        articleSample: {
          title: 'How Autonomous Cloud AI is Powering Enterprise Media in 2026',
          slug: 'autonomous-cloud-ai-enterprise-media-2026',
          category: 'Technology'
        }
      }
    };

    const webhookRes = await axios.post(subscription.webhookUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Blogger-Signature': subscription.webhookSecret,
        'User-Agent': 'AutonomousBlogger-Webhook-Dispatcher/1.0'
      },
      timeout: 8000
    });

    res.json({
      success: true,
      message: `Webhook sent successfully to ${subscription.webhookUrl}! Remote response: HTTP ${webhookRes.status}`,
      statusCode: webhookRes.status,
      remoteData: webhookRes.data
    });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: `Failed to deliver webhook to client URL: ${err.message}`,
      errorDetails: err.response?.data || err.message
    });
  }
});

/**
 * GET /api/subscriptions/keys/:id/docs
 * Generates tailored API documentation & integration kit for a subscription
 */
router.get('/keys/:id/docs', async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const docsData = subscriptionDocsService.generateDocsData(subscription, baseUrl);
    const markdown = subscriptionDocsService.generateMarkdown(docsData);

    res.json({
      success: true,
      docs: docsData,
      markdown,
      previewUrl: `/api/subscriptions/keys/${subscription._id}/docs/preview`,
      downloadMarkdownUrl: `/api/subscriptions/keys/${subscription._id}/docs/download?format=markdown`,
      downloadHtmlUrl: `/api/subscriptions/keys/${subscription._id}/docs/download?format=html`
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/subscriptions/keys/:id/docs/preview
 * Renders standalone, printable HTML documentation page
 */
router.get('/keys/:id/docs/preview', async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).send('Subscription not found.');
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const docsData = subscriptionDocsService.generateDocsData(subscription, baseUrl);
    const html = subscriptionDocsService.generateHtml(docsData);

    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/subscriptions/keys/:id/docs/download
 * Download personalized documentation as .md or .html file
 */
router.get('/keys/:id/docs/download', async (req, res, next) => {
  try {
    const { format = 'markdown' } = req.query;
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).send('Subscription not found.');
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const docsData = subscriptionDocsService.generateDocsData(subscription, baseUrl);
    const safeClientSlug = (subscription.clientName || 'client')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (format === 'html') {
      const html = subscriptionDocsService.generateHtml(docsData);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="blogger-api-docs-${safeClientSlug}.html"`);
      return res.send(html);
    }

    const markdown = subscriptionDocsService.generateMarkdown(docsData);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="blogger-api-docs-${safeClientSlug}.md"`);
    res.send(markdown);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/subscriptions/keys/:id
 * Delete a subscription
 */
router.delete('/keys/:id', async (req, res, next) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    res.json({
      success: true,
      message: `Subscription for ${deleted.clientName} deleted.`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
