const mongoose = require('mongoose');
const crypto = require('crypto');
const { SUBSCRIPTION_PLANS } = require('../config/subscriptionPlans');

const SubscriptionSchema = new mongoose.Schema({
  // The secret API Key passed in headers (e.g. X-API-Key: blg_live_...)
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  websiteUrl: {
    type: String,
    required: true,
    trim: true
  },
  ownerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'enterprise'],
    default: 'free',
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'revoked', 'expired'],
    default: 'active',
    index: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  currency: {
    type: String,
    enum: ['USD', 'INR'],
    default: 'USD'
  },
  pricePaid: {
    type: Number,
    default: 0
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  quotas: {
    monthlyRequests: { type: Number, default: 200 },
    monthlyGenerations: { type: Number, default: 5 },
    rateLimitPerMin: { type: Number, default: 20 }
  },
  usage: {
    requestsThisPeriod: { type: Number, default: 0 },
    generationsThisPeriod: { type: Number, default: 0 },
    totalRequestsAllTime: { type: Number, default: 0 },
    totalGenerationsAllTime: { type: Number, default: 0 },
    lastUsedAt: { type: Date }
  },
  allowedDomains: [{
    type: String,
    trim: true
  }],
  webhookUrl: {
    type: String,
    trim: true,
    default: ''
  },
  webhookSecret: {
    type: String,
    default: () => 'whsec_' + crypto.randomBytes(16).toString('hex')
  },
  customBrandVoice: {
    type: String,
    default: 'Authoritative, engaging, industry-grade technical journalism'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Static helper to create a secure key
SubscriptionSchema.statics.generateKeyString = function(environment = 'live') {
  const prefix = environment === 'test' ? 'blg_test_' : 'blg_live_';
  return prefix + crypto.randomBytes(24).toString('hex');
};

// Check and auto-refresh billing period if past currentPeriodEnd
SubscriptionSchema.methods.checkAndResetPeriod = function() {
  const now = new Date();
  if (now > this.currentPeriodEnd) {
    this.currentPeriodStart = now;
    const daysToAdd = this.billingCycle === 'yearly' ? 365 : 30;
    this.currentPeriodEnd = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    this.usage.requestsThisPeriod = 0;
    this.usage.generationsThisPeriod = 0;
    return true;
  }
  return false;
};

// Check if quota is exceeded
SubscriptionSchema.methods.isQuotaExceeded = function(type = 'request') {
  this.checkAndResetPeriod();
  if (this.status !== 'active') return true;

  if (type === 'generation') {
    return this.usage.generationsThisPeriod >= this.quotas.monthlyGenerations;
  }
  return this.usage.requestsThisPeriod >= this.quotas.monthlyRequests;
};

// Increment usage
SubscriptionSchema.methods.recordUsage = async function(type = 'request', count = 1) {
  this.checkAndResetPeriod();
  this.usage.lastUsedAt = new Date();

  if (type === 'generation') {
    this.usage.generationsThisPeriod += count;
    this.usage.totalGenerationsAllTime += count;
  }
  this.usage.requestsThisPeriod += count;
  this.usage.totalRequestsAllTime += count;

  return this.save();
};

// Update plan quotas based on SUBSCRIPTION_PLANS config
SubscriptionSchema.methods.applyPlanQuotas = function(planId) {
  const planConfig = SUBSCRIPTION_PLANS[planId];
  if (!planConfig) return;
  this.plan = planId;
  this.quotas.monthlyRequests = planConfig.quotas.monthlyRequests;
  this.quotas.monthlyGenerations = planConfig.quotas.monthlyGenerations;
  this.quotas.rateLimitPerMin = planConfig.quotas.rateLimitPerMin;
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);
