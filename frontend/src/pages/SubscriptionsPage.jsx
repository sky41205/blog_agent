import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Key,
  ShieldCheck,
  Zap,
  DollarSign,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  Play,
  Terminal,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Radio,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Globe,
  Code,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SubscriptionAPI } from '../services/api';
import SubscriptionDocsModal from '../components/SubscriptionDocsModal';

export default function SubscriptionsPage() {
  const [overview, setOverview] = useState(null);
  const [plans, setPlans] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'INR'
  const [revealedKeys, setRevealedKeys] = useState({});
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [filterPlan, setFilterPlan] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(null); // holds selected key
  const [showPaymentModal, setShowPaymentModal] = useState(null); // holds selected key + target plan
  const [activeDocsModal, setActiveDocsModal] = useState(null); // holds subscription id
  const [isNewlyCreatedDoc, setIsNewlyCreatedDoc] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [webhookTestStatus, setWebhookTestStatus] = useState(null);

  // Form State
  const [newKeyForm, setNewKeyForm] = useState({
    clientName: '',
    websiteUrl: '',
    ownerEmail: '',
    plan: 'free',
    currency: 'USD',
    webhookUrl: '',
    customBrandVoice: ''
  });

  // Sandbox / API Tester
  const [sandboxKey, setSandboxKey] = useState('');
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/api/v1/blogs?limit=3');
  const [sandboxResponse, setSandboxResponse] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('curl');

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, plansRes, keysRes] = await Promise.all([
        SubscriptionAPI.getOverview(),
        SubscriptionAPI.getPlans(),
        SubscriptionAPI.getKeys({ plan: filterPlan, search: searchQuery })
      ]);

      if (overviewRes.data?.success) setOverview(overviewRes.data.metrics);
      if (plansRes.data?.success) setPlans(plansRes.data.plans);
      if (keysRes.data?.success) {
        setKeys(keysRes.data.keys);
        if (keysRes.data.keys.length > 0 && !sandboxKey) {
          setSandboxKey(keysRes.data.keys[0].key);
        }
      }
    } catch (err) {
      console.error('Failed to load subscriptions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterPlan]);

  const handleCopy = (keyText, id) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const toggleReveal = (id) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      const res = await SubscriptionAPI.createKey(newKeyForm);
      if (res.data?.success) {
        setShowCreateModal(false);
        const createdId = res.data.subscription?.id;
        setNewKeyForm({
          clientName: '',
          websiteUrl: '',
          ownerEmail: '',
          plan: 'free',
          currency: 'USD',
          webhookUrl: '',
          customBrandVoice: ''
        });
        await loadData();
        // Immediately pop up personalized documentation for handoff!
        if (createdId) {
          setActiveDocsModal(createdId);
          setIsNewlyCreatedDoc(true);
        }
      }
    } catch (err) {
      alert('Error creating API key: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpgradePlan = async (keyId, targetPlan) => {
    try {
      const res = await SubscriptionAPI.updatePlan(keyId, {
        plan: targetPlan,
        currency
      });
      if (res.data?.success) {
        setShowUpgradeModal(null);
        await loadData();
      }
    } catch (err) {
      alert('Upgrade error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSimulatePayment = async (keyId, targetPlan) => {
    try {
      const res = await SubscriptionAPI.simulatePayment(keyId, {
        plan: targetPlan,
        currency,
        paymentMethod: currency === 'INR' ? 'Razorpay UPI / NetBanking (Simulated)' : 'Stripe Platinum Card (Simulated)'
      });
      if (res.data?.success) {
        setPaymentReceipt(res.data.receipt);
        await loadData();
      }
    } catch (err) {
      alert('Payment processing error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRegenerate = async (id) => {
    if (!window.confirm('Regenerating this key will immediately revoke the current key for this website. Continue?')) return;
    try {
      await SubscriptionAPI.regenerateKey(id);
      await loadData();
    } catch (err) {
      alert('Regeneration error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await SubscriptionAPI.updateStatus(id, nextStatus);
      await loadData();
    } catch (err) {
      alert('Status update error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTestWebhook = async (id) => {
    try {
      setWebhookTestStatus({ id, loading: true });
      const res = await SubscriptionAPI.testWebhook(id);
      setWebhookTestStatus({
        id,
        loading: false,
        success: res.data?.success,
        message: res.data?.message
      });
    } catch (err) {
      setWebhookTestStatus({
        id,
        loading: false,
        success: false,
        message: err.response?.data?.message || err.message
      });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently revoke and delete API key for "${name}"?`)) return;
    try {
      await SubscriptionAPI.deleteKey(id);
      await loadData();
    } catch (err) {
      alert('Delete error: ' + (err.response?.data?.message || err.message));
    }
  };

  const runSandboxRequest = async () => {
    if (!sandboxKey) {
      alert('Please select or paste an API key to test.');
      return;
    }
    setSandboxLoading(true);
    setSandboxResponse(null);
    try {
      const res = await SubscriptionAPI.testKeyV1(sandboxKey, sandboxEndpoint);
      setSandboxResponse({
        status: res.status,
        headers: res.headers,
        data: res.data
      });
    } catch (err) {
      setSandboxResponse({
        status: err.response?.status || 500,
        headers: err.response?.headers || {},
        data: err.response?.data || { error: err.message }
      });
    } finally {
      setSandboxLoading(false);
    }
  };

  const formatPrice = (usd, inr) => {
    if (currency === 'INR') {
      return inr === 0 ? '₹0' : `₹${inr.toLocaleString()}`;
    }
    return usd === 0 ? '$0' : `$${usd}`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-2xl text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Commercial SaaS Developer Platform
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ● Live Monetization Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            API Subscriptions & Client Monetization Hub
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Monetize your Autonomous Blogger instance. Issue scoped API keys, enforce tiered monthly request & blog generation quotas, dispatch real-time webhooks, and charge external websites.
          </p>
        </div>

        {/* Currency Switcher & Add Key CTA */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 flex items-center">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'USD' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'INR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Issue Website Key
          </button>
        </div>
      </div>

      {/* Financial & Subscription Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Recurring Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {currency === 'INR' ? `₹${(overview?.mrrINR || 0).toLocaleString()}` : `$${(overview?.mrrUSD || 0).toLocaleString()}`}
            <span className="text-xs font-semibold text-slate-400 ml-1">/mo</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ARR: {currency === 'INR' ? `₹${(overview?.annualRunRateINR || 0).toLocaleString()}` : `$${(overview?.annualRunRateUSD || 0).toLocaleString()}`}</span>
          </div>
        </div>

        {/* Active Paying Clients */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Subscribed Websites</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {overview?.totalWebsites || 0}
            <span className="text-xs font-normal text-slate-500 ml-1.5 font-medium">
              ({overview?.paidSubscribers || 0} Paid, {overview?.planBreakdown?.free || 0} Free)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Active Status: <span className="font-bold text-slate-800">{overview?.activeSubscribers || 0} websites active</span>
          </div>
        </div>

        {/* Requests Served */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">API Requests Consumed</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {(overview?.totalRequestsServed || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Sub-millisecond REST latency across /api/v1
          </div>
        </div>

        {/* Full Blog Generations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">On-Demand Articles Built</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {(overview?.totalGenerationsExecuted || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-purple-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Vertex AI Fact-Audited
          </div>
        </div>
      </div>

      {/* Subscription Pricing Tiers Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Subscription Plans & Capabilities</h2>
            <p className="text-xs text-slate-500">Pick a plan for new client websites or upgrade existing accounts.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
            Current Billing: {currency}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isPopular = p.popular;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-5 bg-white border transition-all flex flex-col justify-between ${
                  isPopular
                    ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-lg shadow-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-indigo-600 text-white shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-slate-900 text-base">{p.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 h-10 leading-snug">{p.description}</p>

                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                      {formatPrice(p.priceMonthlyUSD, p.priceMonthlyINR)}
                      <span className="text-xs font-normal text-slate-400 ml-1 font-semibold">/ month</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                      Billed monthly • Cancel anytime
                    </div>
                  </div>

                  {/* Quotas Pill Strip */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Requests:</span>
                      <span className="font-bold text-slate-800">{p.quotas.monthlyRequests.toLocaleString()} / mo</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Generations:</span>
                      <span className="font-bold text-indigo-700">{p.quotas.monthlyGenerations.toLocaleString()} articles / mo</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Speed Limit:</span>
                      <span className="font-bold text-slate-800">{p.quotas.rateLimitPerMin} req / min</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 mb-6 text-xs text-slate-600">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setNewKeyForm(prev => ({ ...prev, plan: p.id }));
                    setShowCreateModal(true);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Create Key on {p.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Websites & API Keys Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Active Client Subscriptions & API Keys</h2>
            <p className="text-xs text-slate-500">Monitor live quota utilization, active billing cycles, and client webhooks.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Plans</option>
              <option value="free">Free Developer</option>
              <option value="starter">Starter Publisher</option>
              <option value="pro">Pro Business</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            Loading subscriptions and quota tracking...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Key className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No subscription API keys found.</p>
            <p className="text-xs text-slate-400">Generate your first key to start charging client websites.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              + Create First Key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Client Website</th>
                  <th className="py-3 px-4">Plan & Price</th>
                  <th className="py-3 px-4">API Key</th>
                  <th className="py-3 px-4">Monthly Quota Usage</th>
                  <th className="py-3 px-4">Webhook & Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((k) => {
                  const isRevealed = revealedKeys[k.id];
                  const planBadgeColors = {
                    free: 'bg-slate-100 text-slate-700 border-slate-200',
                    starter: 'bg-blue-50 text-blue-700 border-blue-200',
                    pro: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    enterprise: 'bg-purple-50 text-purple-700 border-purple-200'
                  };

                  return (
                    <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Client Name & Website */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {k.clientName}
                        </div>
                        <a
                          href={k.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {k.websiteUrl} <ArrowUpRight className="w-2.5 h-2.5" />
                        </a>
                        <div className="text-[10px] text-slate-400 mt-0.5">{k.ownerEmail}</div>
                      </td>

                      {/* Plan & Pricing */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border uppercase ${planBadgeColors[k.plan] || planBadgeColors.free}`}>
                          {k.planName}
                        </span>
                        <div className="font-bold text-slate-800 mt-1">
                          {formatPrice(k.priceMonthlyUSD, k.priceMonthlyINR)}
                          <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{k.daysRemaining} days left in cycle</div>
                      </td>

                      {/* API Key with Mask & Copy */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 w-fit">
                          <span className="text-slate-700 select-all">
                            {isRevealed ? k.key : k.maskedKey}
                          </span>
                          <button
                            onClick={() => toggleReveal(k.id)}
                            className="text-slate-400 hover:text-slate-600"
                            title={isRevealed ? "Hide Key" : "Reveal Key"}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopy(k.key, k.id)}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Copy API Key"
                          >
                            {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Quota Progress */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="space-y-1.5">
                          {/* Requests Bar */}
                          <div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">API Requests:</span>
                              <span className="font-bold text-slate-800">
                                {k.usage.requestsThisPeriod.toLocaleString()} / {k.quotas.monthlyRequests.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-0.5">
                              <div
                                className={`h-full rounded-full ${
                                  k.requestsPercentUsed > 90 ? 'bg-rose-500' : (k.requestsPercentUsed > 75 ? 'bg-amber-500' : 'bg-indigo-600')
                                }`}
                                style={{ width: `${Math.min(100, k.requestsPercentUsed)}%` }}
                              />
                            </div>
                          </div>

                          {/* Articles Generated Bar */}
                          <div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Articles Built:</span>
                              <span className="font-bold text-purple-700">
                                {k.usage.generationsThisPeriod} / {k.quotas.monthlyGenerations}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-0.5">
                              <div
                                className="h-full rounded-full bg-purple-600"
                                style={{ width: `${Math.min(100, k.generationsPercentUsed)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Webhook & Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full ${k.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="font-bold capitalize text-slate-800">{k.status}</span>
                        </div>
                        {k.webhookUrl ? (
                          <div className="text-[10px] text-slate-500 truncate max-w-[150px]" title={k.webhookUrl}>
                            📡 {k.webhookUrl}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">No Webhook Configured</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Documentation & Integration Kit */}
                          <button
                            onClick={() => {
                              setActiveDocsModal(k.id);
                              setIsNewlyCreatedDoc(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                            title="View & Export Personalized Documentation"
                          >
                            <BookOpen className="w-3 h-3 text-indigo-600" />
                            <span>Docs</span>
                          </button>

                          {/* Test Webhook */}
                          {k.webhookUrl && (
                            <button
                              onClick={() => handleTestWebhook(k.id)}
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                              title="Test Webhook Ping"
                            >
                              Ping Hook
                            </button>
                          )}

                          {/* Upgrade Plan */}
                          <button
                            onClick={() => setShowUpgradeModal(k)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px]"
                          >
                            Plan
                          </button>

                          {/* Simulate Payment */}
                          <button
                            onClick={() => setShowPaymentModal({ key: k, targetPlan: k.plan === 'free' ? 'pro' : k.plan })}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1"
                            title="Simulate Stripe / Razorpay Checkout"
                          >
                            <CreditCard className="w-3 h-3" /> Pay
                          </button>

                          {/* Pause / Resume */}
                          <button
                            onClick={() => handleToggleStatus(k.id, k.status)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title={k.status === 'active' ? 'Pause Key' : 'Activate Key'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(k.id, k.clientName)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Revoke / Delete Key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Developer Integration & Drop-In Widget Sandbox */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 text-white p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-extrabold text-white">Client Website Integration & Code Snippets</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Provide these exact snippets to external website clients to embed articles or fetch feeds using their API key.
            </p>
          </div>

          {/* Code Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {['curl', 'javascript', 'python', 'widget'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCodeTab === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'widget' ? 'Drop-in Widget' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
          <button
            onClick={() => {
              const codeEl = document.getElementById('active-code-snippet');
              if (codeEl) handleCopy(codeEl.innerText, 'code-box');
            }}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans flex items-center gap-1"
          >
            {copiedKeyId === 'code-box' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy Snippet
          </button>

          <pre id="active-code-snippet" className="pt-2">
            {activeCodeTab === 'curl' && `# 1. Fetch live published blogs for external website\ncurl -X GET "http://localhost:5000/api/v1/blogs?limit=5" \\\n     -H "X-API-Key: ${sandboxKey || 'YOUR_API_KEY'}"\n\n# 2. Trigger On-Demand AI Blog Generation with Vertex AI Grounding\ncurl -X POST "http://localhost:5000/api/v1/blogs/generate" \\\n     -H "Content-Type: application/json" \\\n     -H "X-API-Key: ${sandboxKey || 'YOUR_API_KEY'}" \\\n     -d '{\n       "topic": "Autonomous Cloud Agents in 2026",\n       "category": "Technology",\n       "targetWordCount": 850\n     }'`}

            {activeCodeTab === 'javascript' && `// Client Website Frontend / Backend (Node.js, Next.js, React)\nconst API_KEY = '${sandboxKey || 'YOUR_API_KEY'}';\n\nasync function fetchLatestArticles() {\n  const res = await fetch('http://localhost:5000/api/v1/blogs?limit=6', {\n    headers: {\n      'X-API-Key': API_KEY\n    }\n  });\n  const data = await res.json();\n  console.log('Published Articles:', data.data);\n  return data.data;\n}\n\nfetchLatestArticles();`}

            {activeCodeTab === 'python' && `# Python Client Integration (Flask, Django, FastAPI)\nimport requests\n\nAPI_KEY = "${sandboxKey || 'YOUR_API_KEY'}"\nHEADERS = {"X-API-Key": API_KEY}\n\n# Get live verified feed\nresponse = requests.get("http://localhost:5000/api/v1/blogs", headers=HEADERS)\narticles = response.json().get("data", [])\nprint(f"Loaded {len(articles)} articles!")\n\n# Request autonomous generation\ngen_resp = requests.post(\n    "http://localhost:5000/api/v1/blogs/generate",\n    headers=HEADERS,\n    json={"topic": "Quantum Vector Embeddings in Multi-Tenant Clouds"}\n)\nprint("Generated Blog:", gen_resp.json())`}

            {activeCodeTab === 'widget' && `<!-- 1-Line Drop-in Widget for ANY Website (WordPress, Webflow, HTML, Shopify) -->\n<div id="blogger-news-feed"></div>\n<script \n  src="http://localhost:5000/api/public/blogger-client.js"\n  data-api-key="${sandboxKey || 'YOUR_API_KEY'}"\n  data-container="#blogger-news-feed"\n  data-limit="6"\n  data-theme="modern">\n</script>`}
          </pre>
        </div>

        {/* Live Interactive API Key Sandbox */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-400" /> Interactive Key Sandbox (Live Test)
            </span>
            <span className="text-[11px] text-slate-400">Verifies headers, quotas, and permissions live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              value={sandboxKey}
              onChange={(e) => setSandboxKey(e.target.value)}
              placeholder="Paste or select X-API-Key..."
              className="text-xs font-mono bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={sandboxEndpoint}
              onChange={(e) => setSandboxEndpoint(e.target.value)}
              className="text-xs font-mono bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="/api/v1/account">GET /api/v1/account (Plan & Quotas)</option>
              <option value="/api/v1/topics?category=Finance&limit=3">GET /api/v1/topics?category=Finance (Finance Topics)</option>
              <option value="/api/v1/topics?category=NGOs&limit=3">GET /api/v1/topics?category=NGOs (NGOs & Philanthropy)</option>
              <option value="/api/v1/topics?category=Technology&limit=3">GET /api/v1/topics?category=Technology (Technology & AI)</option>
              <option value="/api/v1/topics?category=Causes&limit=3">GET /api/v1/topics?category=Causes (Social Causes & Impact)</option>
              <option value="/api/v1/topics/categories">GET /api/v1/topics/categories (All Categories Taxonomy)</option>
              <option value="/api/v1/blogs?limit=3">GET /api/v1/blogs (Headless Articles Feed)</option>
              <option value="/api/v1/trends/radar">GET /api/v1/trends/radar (Predictive Radar)</option>
            </select>
            <button
              onClick={runSandboxRequest}
              disabled={sandboxLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {sandboxLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {sandboxLoading ? 'Executing Call...' : 'Send Live API Call'}
            </button>
          </div>

          {sandboxResponse && (
            <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 mb-2">
                <span>Response Status: <strong className={sandboxResponse.status < 400 ? 'text-emerald-400' : 'text-rose-400'}>HTTP {sandboxResponse.status}</strong></span>
                <span>Plan: <strong className="text-indigo-400">{sandboxResponse.headers['x-subscription-plan'] || 'N/A'}</strong></span>
                <span>Remaining: <strong className="text-amber-400">{sandboxResponse.headers['x-subscription-requests-remaining'] || 'N/A'}</strong></span>
              </div>
              <pre className="text-slate-300 text-[10px]">
                {JSON.stringify(sandboxResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* CREATE API KEY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" /> Issue Subscription API Key
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Website / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Tech Media"
                  value={newKeyForm.clientName}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, clientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Website URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://nextgentech.io"
                  value={newKeyForm.websiteUrl}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Billing / Owner Email *</label>
                <input
                  type="email"
                  required
                  placeholder="billing@nextgentech.io"
                  value={newKeyForm.ownerEmail}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subscription Plan</label>
                  <select
                    value={newKeyForm.plan}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, plan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="free">Free Developer ($0)</option>
                    <option value="starter">Starter Publisher ($29/mo)</option>
                    <option value="pro">Pro Business ($79/mo)</option>
                    <option value="enterprise">Enterprise Scale ($249/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Currency</label>
                  <select
                    value={newKeyForm.currency}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Webhook Dispatch URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://nextgentech.io/api/webhooks/blogger-ingest"
                  value={newKeyForm.webhookUrl}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, webhookUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-200"
                >
                  Generate & Activate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPGRADE PLAN MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Upgrade Plan: {showUpgradeModal.clientName}
              </h3>
              <button
                onClick={() => setShowUpgradeModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select the new tier for this website. Quotas and rate limits will be applied immediately.
            </p>

            <div className="space-y-2">
              {['free', 'starter', 'pro', 'enterprise'].map((pId) => {
                const p = plans.find(x => x.id === pId);
                if (!p) return null;
                const isCurrent = showUpgradeModal.plan === pId;

                return (
                  <button
                    key={pId}
                    disabled={isCurrent}
                    onClick={() => handleUpgradePlan(showUpgradeModal.id, pId)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 cursor-default'
                        : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-xs flex items-center gap-1.5">
                        {p.name} {isCurrent && <span className="text-[10px] text-indigo-600 font-bold">(Current)</span>}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.quotas.monthlyRequests.toLocaleString()} requests • {p.quotas.monthlyGenerations} articles/mo
                      </div>
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      {formatPrice(p.priceMonthlyUSD, p.priceMonthlyINR)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SIMULATE STRIPE / RAZORPAY CHECKOUT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Simulate Payment & Activate Plan
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(null);
                  setPaymentReceipt(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {paymentReceipt ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-extrabold text-sm">Payment Successful!</h4>
                  <p className="text-xs text-emerald-700">Receipt Generated & Quotas Reset</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice:</span>
                    <span className="font-bold text-slate-800">{paymentReceipt.invoiceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client:</span>
                    <span className="font-bold text-slate-800">{paymentReceipt.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plan:</span>
                    <span className="font-bold text-indigo-600">{paymentReceipt.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Charged:</span>
                    <span className="font-bold text-emerald-700">
                      {paymentReceipt.currency === 'INR' ? '₹' : '$'}{paymentReceipt.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valid Until:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(paymentReceipt.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPaymentModal(null);
                    setPaymentReceipt(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Simulate an immediate client payment checkout for <strong>{showPaymentModal.key.clientName}</strong>. This processes instant activation, resets monthly usage counters, and issues an official invoice receipt.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-500">Target Plan:</span>
                    <span className="font-bold text-indigo-700 uppercase">{showPaymentModal.targetPlan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-500">Billing Currency:</span>
                    <span className="font-bold text-slate-800">{currency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-500">Simulated Gateway:</span>
                    <span className="font-bold text-slate-800">
                      {currency === 'INR' ? 'Razorpay (Instant UPI/Cards)' : 'Stripe Checkout (Cards/ACH)'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSimulatePayment(showPaymentModal.key.id, showPaymentModal.targetPlan)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Confirm & Simulate Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBSCRIPTION DOCUMENTATION & INTEGRATION MODAL */}
      {activeDocsModal && (
        <SubscriptionDocsModal
          subscriptionId={activeDocsModal}
          isNewCreation={isNewlyCreatedDoc}
          onClose={() => {
            setActiveDocsModal(null);
            setIsNewlyCreatedDoc(false);
          }}
        />
      )}
    </div>
  );
}
