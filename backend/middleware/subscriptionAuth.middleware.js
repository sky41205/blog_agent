const Subscription = require('../models/Subscription');
const { SUBSCRIPTION_PLANS } = require('../config/subscriptionPlans');

/**
 * Middleware to authenticate requests via Subscription API Key
 * Validates key validity, active status, billing cycle reset, and quotas.
 */
const requireSubscriptionAuth = async (req, res, next) => {
  try {
    // 1. Extract API Key
    let apiKey = req.headers['x-api-key'] || req.headers['x-blogger-api-key'];

    if (!apiKey && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && (parts[0] === 'Bearer' || parts[0] === 'ApiKey')) {
        if (parts[1].startsWith('blg_')) {
          apiKey = parts[1];
        }
      }
    }

    if (!apiKey && req.query.apiKey) {
      apiKey = req.query.apiKey;
    }

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'MISSING_API_KEY',
        message: 'Subscription API key required to access this service.',
        documentation: 'http://localhost:3000/subscriptions',
        hint: "Pass your API key in the 'X-API-Key' header or '?apiKey=YOUR_KEY' query parameter."
      });
    }

    // 2. Query Subscription Record
    const subscription = await Subscription.findOne({ key: apiKey.trim() });

    if (!subscription) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_KEY',
        message: 'The provided API key does not exist or has been deleted.'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'SUBSCRIPTION_INACTIVE',
        message: `Subscription for ${subscription.clientName} is currently ${subscription.status}. Please contact support or update your billing details.`
      });
    }

    // 3. Auto-check & rollover billing cycle if period has ended
    subscription.checkAndResetPeriod();

    // 4. Domain / Origin Whitelisting check (if configured by client)
    if (subscription.allowedDomains && subscription.allowedDomains.length > 0) {
      const origin = req.headers.origin || req.headers.referer || '';
      let clientHost = '';
      try {
        if (origin) {
          const parsed = origin.startsWith('http') ? new URL(origin) : new URL('http://' + origin);
          clientHost = parsed.hostname;
        }
      } catch (e) {
        clientHost = origin;
      }

      const isLocalDev = clientHost === 'localhost' || clientHost === '127.0.0.1' || !clientHost;
      const isAllowed = isLocalDev || subscription.allowedDomains.some(domain => {
        const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        return clientHost === cleanDomain || clientHost.endsWith('.' + cleanDomain) || cleanDomain === '*';
      });

      if (origin && !isAllowed) {
        return res.status(403).json({
          success: false,
          error: 'DOMAIN_NOT_AUTHORIZED',
          message: `Origin '${clientHost}' is not authorized to use this API key. Configured allowed domains: ${subscription.allowedDomains.join(', ')}`
        });
      }
    }

    // 5. Check Monthly Request Quota
    if (subscription.usage.requestsThisPeriod >= subscription.quotas.monthlyRequests) {
      return res.status(429).json({
        success: false,
        error: 'REQUEST_QUOTA_EXCEEDED',
        message: `Monthly request quota of ${subscription.quotas.monthlyRequests.toLocaleString()} reached for the ${subscription.plan.toUpperCase()} plan.`,
        plan: subscription.plan,
        periodEnd: subscription.currentPeriodEnd,
        upgradeUrl: 'http://localhost:3000/subscriptions'
      });
    }

    // 6. Set Standard Headers
    const remainingRequests = Math.max(0, subscription.quotas.monthlyRequests - subscription.usage.requestsThisPeriod - 1);
    const remainingGenerations = Math.max(0, subscription.quotas.monthlyGenerations - subscription.usage.generationsThisPeriod);

    res.setHeader('X-Subscription-Plan', subscription.plan);
    res.setHeader('X-Subscription-Requests-Limit', subscription.quotas.monthlyRequests);
    res.setHeader('X-Subscription-Requests-Remaining', remainingRequests);
    res.setHeader('X-Subscription-Generations-Remaining', remainingGenerations);
    res.setHeader('X-Subscription-Period-End', subscription.currentPeriodEnd.toISOString());

    // 7. Attach to request
    req.subscription = subscription;
    req.planConfig = SUBSCRIPTION_PLANS[subscription.plan] || SUBSCRIPTION_PLANS.free;

    // Record request usage automatically
    await subscription.recordUsage('request', 1);

    next();
  } catch (err) {
    console.error('[SubscriptionAuth Middleware Error]', err);
    res.status(500).json({ success: false, message: 'Internal subscription authorization error.' });
  }
};

/**
 * Middleware ensuring generation quota is available before executing heavy LLM generation
 */
const requireGenerationQuota = async (req, res, next) => {
  try {
    const subscription = req.subscription;
    if (!subscription) {
      return res.status(401).json({ success: false, message: 'Subscription context missing.' });
    }

    if (subscription.usage.generationsThisPeriod >= subscription.quotas.monthlyGenerations) {
      return res.status(429).json({
        success: false,
        error: 'GENERATION_QUOTA_EXCEEDED',
        message: `Monthly blog generation quota (${subscription.quotas.monthlyGenerations} articles) reached for ${subscription.clientName}. Upgrade to Pro or Enterprise for higher limits.`,
        plan: subscription.plan,
        used: subscription.usage.generationsThisPeriod,
        limit: subscription.quotas.monthlyGenerations,
        periodEnd: subscription.currentPeriodEnd,
        upgradeUrl: 'http://localhost:3000/subscriptions'
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireSubscriptionAuth,
  requireGenerationQuota
};
