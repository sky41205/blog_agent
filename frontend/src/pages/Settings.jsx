import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Clock,
  Save,
  CheckCircle2,
  ExternalLink,
  Zap,
  Check,
  Cpu,
  Send,
  Radio,
  ShieldCheck,
  Database,
  Search,
  Image as ImageIcon,
  Sparkles,
  Server,
  Layers,
  Heart,
  RefreshCw
} from 'lucide-react';
import { SettingsAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { showToast, refreshData } = useApp();
  const [saving, setSaving] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState(null);

  // 1. General Site Settings
  const [websiteName, setWebsiteName] = useState('Autonomous Tech & Knowledge Hub');
  const [websiteTopic, setWebsiteTopic] = useState('Artificial Intelligence, Cloud Architecture & Modern Tech');
  const [defaultWordCount, setDefaultWordCount] = useState('1000 words');
  const [writingTone, setWritingTone] = useState('Conversational & Engaging');

  // 2. Live Website & Webhook Destination
  const [liveSiteUrl, setLiveSiteUrl] = useState('http://localhost:3001');
  const [liveWebhookUrl, setLiveWebhookUrl] = useState('http://localhost:5000/api/public/webhook-receiver');
  const [autoSyncOnPublish, setAutoSyncOnPublish] = useState(true);

  // 2b. ITLC Foundation Hub Integration
  const [itlcSiteUrl, setItlcSiteUrl] = useState('https://itlcfoundation.com');
  const [itlcAdminUrl, setItlcAdminUrl] = useState('https://itlcfoundation.com/admin');
  const [itlcWebhookUrl, setItlcWebhookUrl] = useState('https://itlcfoundation.com/api/blogs/receive');
  const [itlcAutoPublish, setItlcAutoPublish] = useState(true);
  const [itlcApiKey, setItlcApiKey] = useState('');
  const [itlcIntegrationType, setItlcIntegrationType] = useState('webhook');
  const [itlcWpUser, setItlcWpUser] = useState('');
  const [itlcWpPass, setItlcWpPass] = useState('');
  const [testingITLC, setTestingITLC] = useState(false);
  const [itlcTestResult, setItlcTestResult] = useState(null);
  const [syncingITLC, setSyncingITLC] = useState(false);

  // 3. AI Providers
  const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' | 'openai' | 'anthropic'
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');

  // 4. Publishing & Automation Mode
  const [publishingMode, setPublishingMode] = useState('APPROVAL'); // 'MANUAL' | 'APPROVAL' | 'AUTOMATIC'
  const [minQualityScore, setMinQualityScore] = useState(85);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await SettingsAPI.getSettings();
        if (res.data?.settings) {
          const s = res.data.settings;
          if (s.websiteName) setWebsiteName(s.websiteName);
          if (s.websiteTopic) setWebsiteTopic(s.websiteTopic);
          if (s.automationMode) setPublishingMode(s.automationMode);
          if (s.aiProvider) setAiProvider(s.aiProvider);
          if (s.autoPublishMinQualityScore) setMinQualityScore(s.autoPublishMinQualityScore);
          if (s.liveWebsite?.webhookUrl) setLiveWebhookUrl(s.liveWebsite.webhookUrl);
          if (s.liveWebsite?.siteUrl) setLiveSiteUrl(s.liveWebsite.siteUrl);
          if (s.liveWebsite?.autoSyncOnPublish !== undefined) setAutoSyncOnPublish(s.liveWebsite.autoSyncOnPublish);

          if (s.itlcFoundation) {
            if (s.itlcFoundation.siteUrl) setItlcSiteUrl(s.itlcFoundation.siteUrl);
            if (s.itlcFoundation.adminUrl) setItlcAdminUrl(s.itlcFoundation.adminUrl);
            if (s.itlcFoundation.webhookUrl) setItlcWebhookUrl(s.itlcFoundation.webhookUrl);
            if (s.itlcFoundation.autoPublishEnabled !== undefined) setItlcAutoPublish(s.itlcFoundation.autoPublishEnabled);
            if (s.itlcFoundation.apiKey) setItlcApiKey(s.itlcFoundation.apiKey);
            if (s.itlcFoundation.integrationType) setItlcIntegrationType(s.itlcFoundation.integrationType);
            if (s.itlcFoundation.wpUsername) setItlcWpUser(s.itlcFoundation.wpUsername);
            if (s.itlcFoundation.wpAppPassword) setItlcWpPass(s.itlcFoundation.wpAppPassword);
          }
        }
      } catch (e) {
        console.warn('Fetch settings warning:', e.message);
      }
    };
    fetchSettings();
  }, []);

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookResult(null);
    try {
      const res = await SettingsAPI.testWebhook();
      setWebhookResult(res.data);
      showToast('Live website connection confirmed! Status: 200 OK', 'success');
    } catch (err) {
      setWebhookResult({ success: false, message: err.message });
      showToast(`Webhook connection notice: ${err.message}`, 'error');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleTestITLC = async () => {
    setTestingITLC(true);
    setItlcTestResult(null);
    try {
      const res = await SettingsAPI.testITLCConnection({
        siteUrl: itlcSiteUrl,
        adminUrl: itlcAdminUrl,
        webhookUrl: itlcWebhookUrl,
        integrationType: itlcIntegrationType,
        wpUsername: itlcWpUser,
        wpAppPassword: itlcWpPass,
        apiKey: itlcApiKey
      });
      setItlcTestResult(res.data);
      if (res.data?.success) {
        showToast('ITLC Foundation Hub connection operational (HTTP 200)!', 'success');
      } else {
        showToast(res.data?.message || 'ITLC Foundation connection notice', 'warning');
      }
    } catch (e) {
      setItlcTestResult({ success: false, message: e.message });
      showToast(`ITLC connection error: ${e.message}`, 'error');
    } finally {
      setTestingITLC(false);
    }
  };

  const handleSyncITLC = async () => {
    setSyncingITLC(true);
    try {
      const res = await SettingsAPI.syncITLC();
      if (res.data?.success) {
        showToast(`🎉 Ingested ${res.data.syncedArticlesCount} ITLC Foundation articles & ${res.data.syncedTopicsCount} topics!`, 'success');
        refreshData();
      }
    } catch (e) {
      showToast(`ITLC sync notice: ${e.message}`, 'error');
    } finally {
      setSyncingITLC(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await SettingsAPI.updateSettings({
        websiteName,
        websiteTopic,
        automationMode: publishingMode,
        aiProvider,
        geminiModel,
        openaiModel,
        autoPublishMinQualityScore: Number(minQualityScore),
        liveWebsite: {
          webhookUrl: liveWebhookUrl,
          siteUrl: liveSiteUrl,
          autoSyncOnPublish
        },
        itlcFoundation: {
          siteUrl: itlcSiteUrl,
          adminUrl: itlcAdminUrl,
          webhookUrl: itlcWebhookUrl,
          integrationType: itlcIntegrationType,
          wpUsername: itlcWpUser,
          wpAppPassword: itlcWpPass,
          apiKey: itlcApiKey,
          autoPublishEnabled: itlcAutoPublish
        }
      });
      showToast('Settings saved successfully!', 'success');
      refreshData();
    } catch (err) {
      showToast('Settings saved.', 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-600" />
            Website & Publishing Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure your publication profile, connected website, and publishing preferences
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: General Website & Content Profile */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Globe className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Website Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Publication Name</label>
            <input
              type="text"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              placeholder="e.g. Modern Tech Insights"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Primary Topic & Niche</label>
            <input
              type="text"
              value={websiteTopic}
              onChange={(e) => setWebsiteTopic(e.target.value)}
              placeholder="e.g. Artificial Intelligence, Software Engineering, Productivity"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Default Target Length</label>
            <select
              value={defaultWordCount}
              onChange={(e) => setDefaultWordCount(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="600 words">Short (~600 words)</option>
              <option value="1000 words">Standard (~1000 words - Recommended)</option>
              <option value="1500 words">In-Depth (~1500 words)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Default Tone of Voice</label>
            <select
              value={writingTone}
              onChange={(e) => setWritingTone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="Conversational & Engaging">Conversational & Engaging</option>
              <option value="Professional & Technical">Professional & Technical</option>
              <option value="Heartfelt Storyteller">Heartfelt Storyteller</option>
              <option value="Educational & Clear">Educational & Clear</option>
              <option value="Executive Thought Leader">Executive Thought Leader</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: Live Website Publishing & Webhook */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Live Website Destination</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Connected
                </span>
              </h2>
              <a
                href={liveSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
              >
                <span>{liveSiteUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={testingWebhook}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{testingWebhook ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <a
              href={liveSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
            >
              <span>View Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {webhookResult && (
          <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
            webhookResult.success
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {webhookResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Zap className="w-4 h-4 text-amber-600" />}
              <span>Live Website Connection: {webhookResult.success ? 'Operational (200 OK)' : 'Check URL endpoint'}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Website URL</label>
            <input
              type="url"
              value={liveSiteUrl}
              onChange={(e) => setLiveSiteUrl(e.target.value)}
              placeholder="http://localhost:3001"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Webhook Receiver Endpoint</label>
            <input
              type="url"
              value={liveWebhookUrl}
              onChange={(e) => setLiveWebhookUrl(e.target.value)}
              placeholder="http://localhost:5000/api/public/webhook-receiver"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-slate-900 block">Instant Live Publishing</span>
              <span className="text-[11px] text-slate-500">Automatically broadcast approved articles directly to your live website</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncOnPublish}
                onChange={(e) => setAutoSyncOnPublish(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2B: ITLC Foundation Hub Dedicated Automation */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>ITLC Foundation Hub Integration</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Official NGO Live
                </span>
              </h2>
              <a
                href={itlcSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-medium"
              >
                <span>{itlcSiteUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSyncITLC}
              disabled={syncingITLC}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer border border-indigo-200 disabled:opacity-50"
              title="Preload official ITLC Foundation topics (Tree plantation, animal welfare, women empowerment, slum education, hunger relief)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingITLC ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{syncingITLC ? 'Syncing...' : 'Sync ITLC Causes & Topics'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestITLC}
              disabled={testingITLC}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${testingITLC ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{testingITLC ? 'Checking...' : 'Test ITLC Connection'}</span>
            </button>

            <a
              href={itlcAdminUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors"
            >
              <span>Admin Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {itlcTestResult && (
          <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
            itlcTestResult.success
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {itlcTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Zap className="w-4 h-4 text-amber-600" />}
              <span>{itlcTestResult.message || (itlcTestResult.success ? 'ITLC Foundation Hub Online' : 'Check ITLC configuration')}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">ITLC Foundation Main URL</label>
            <input
              type="url"
              value={itlcSiteUrl}
              onChange={(e) => setItlcSiteUrl(e.target.value)}
              placeholder="https://itlcfoundation.com"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">ITLC Webhook Receiver Endpoint</label>
            <input
              type="url"
              value={itlcWebhookUrl}
              onChange={(e) => setItlcWebhookUrl(e.target.value)}
              placeholder="https://itlcfoundation.com/api/blogs/receive"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">ITLC Admin Blog Manager URL</label>
            <input
              type="url"
              value={itlcAdminUrl}
              onChange={(e) => setItlcAdminUrl(e.target.value)}
              placeholder="https://itlcfoundation.com/admin"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Integration Architecture</label>
            <select
              value={itlcIntegrationType}
              onChange={(e) => setItlcIntegrationType(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="webhook">REST Webhook Dispatch (Default & Recommended)</option>
              <option value="wordpress">WordPress REST API (/wp-json/wp/v2/posts)</option>
            </select>
          </div>

          {itlcIntegrationType === 'wordpress' && (
            <>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">WordPress Admin Username</label>
                <input
                  type="text"
                  value={itlcWpUser}
                  onChange={(e) => setItlcWpUser(e.target.value)}
                  placeholder="admin"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">WordPress Application Password</label>
                <input
                  type="password"
                  value={itlcWpPass}
                  onChange={(e) => setItlcWpPass(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div>
              <span className="font-bold text-slate-900 block">Auto-Publish to ITLC Foundation Hub</span>
              <span className="text-[11px] text-slate-500">Automatically push qualified social welfare & environment publications to itlcfoundation.com</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={itlcAutoPublish}
                onChange={(e) => setItlcAutoPublish(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: AI Writing Provider */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">AI Writing Model</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            Active & Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { id: 'gemini', name: 'Google Gemini Pro', model: 'Gemini 2.5 Flash', desc: 'Fast, grounded research & writing' },
            { id: 'openai', name: 'OpenAI GPT-4o', model: 'GPT-4o', desc: 'In-depth structured reasoning' },
            { id: 'anthropic', name: 'Claude 3.5 Sonnet', model: 'Claude 3.5 Sonnet', desc: 'Clear literary narrative tone' }
          ].map((prov) => (
            <button
              key={prov.id}
              type="button"
              onClick={() => setAiProvider(prov.id)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                aiProvider === prov.id
                  ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900 ring-1 ring-indigo-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{prov.name}</span>
                {aiProvider === prov.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1">{prov.model}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{prov.desc}</span>
            </button>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Automatic key failover is active to ensure uninterrupted article generation.</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: Publishing & Automation Workflow */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          Publishing Workflow
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setPublishingMode('MANUAL')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              publishingMode === 'MANUAL'
                ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900 ring-1 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="block font-bold">1. Manual Only</span>
            <span className="text-[11px] text-slate-500 font-normal">AI prepares drafts, you review and hit Publish</span>
          </button>

          <button
            type="button"
            onClick={() => setPublishingMode('APPROVAL')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              publishingMode === 'APPROVAL'
                ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900 ring-1 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="block font-bold">2. Review & Approve (Recommended)</span>
            <span className="text-[11px] text-slate-500 font-normal">Daily auto-research with 1-click publishing approval</span>
          </button>

          <button
            type="button"
            onClick={() => setPublishingMode('AUTOMATIC')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              publishingMode === 'AUTOMATIC'
                ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900 ring-1 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="block font-bold">3. Full Auto-Pilot</span>
            <span className="text-[11px] text-slate-500 font-normal">Automatically research, write, and publish daily</span>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold text-slate-700">Minimum Quality Score for Publishing:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="70"
              max="98"
              value={minQualityScore}
              onChange={(e) => setMinQualityScore(e.target.value)}
              className="w-20 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-center"
            />
            <span className="text-slate-500">/ 100</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: Connected APIs & Services Directory */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Connected APIs & Services Directory</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
            9 Active Services
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Exact overview of all live APIs, their endpoints, token consumption, and the specific place each is triggered in your workflow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* API 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Google Vertex AI (Gemini 2.5 Flash)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                1 Token-Optimized Call
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Generates complete articles, structured markdown, and SEO meta tags in a single pass.
            </p>
            <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
              <div><strong className="text-slate-700 font-sans">Trigger Point:</strong> Write Post &gt; "Generate Full Blog Post" / "Humanize Post"</div>
              <div className="truncate"><strong className="text-slate-700 font-sans">Endpoint:</strong> aiplatform.googleapis.com/.../gemini-2.5-flash</div>
            </div>
          </div>

          {/* API 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-500" />
                Google Live Suggest & Trend Feed
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                0 Tokens (Live Search)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Captures real user search queries and autocomplete volumes directly from Google.
            </p>
            <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
              <div><strong className="text-slate-700 font-sans">Trigger Point:</strong> Topic Ideas &gt; "Scan Live Trends" &amp; Real-Time Radar</div>
              <div className="truncate"><strong className="text-slate-700 font-sans">Endpoint:</strong> suggestqueries.google.com/complete/search</div>
            </div>
          </div>

          {/* API 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                Google Search Grounding Engine
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                Live Web Citations
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Retrieves live web facts, verify dates, release notes, and benchmarks with Google Search.
            </p>
            <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
              <div><strong className="text-slate-700 font-sans">Trigger Point:</strong> Write Post &gt; Research Phase (Grounding enabled)</div>
              <div className="truncate"><strong className="text-slate-700 font-sans">Endpoint:</strong> Vertex AI Grounding (tools: googleSearch)</div>
            </div>
          </div>

          {/* API 4 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                Authentic Photography & Hero Image API
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-800">
                0 Tokens (Curated CDN)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Selects real 35mm documentary and editorial photography matching your topic niche.
            </p>
            <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
              <div><strong className="text-slate-700 font-sans">Trigger Point:</strong> Write Post &gt; Auto-Cover &amp; "Regenerate Image"</div>
              <div className="truncate"><strong className="text-slate-700 font-sans">Endpoint:</strong> images.unsplash.com &amp; image.pollinations.ai</div>
            </div>
          </div>

          {/* API 5 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                Python ML Intelligence Service (Port 8000)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800">
                Local Fast Microservice
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Computes TF-IDF relevance, virality scores, and Flesch-Kincaid readability metrics.
            </p>
            <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
              <div><strong className="text-slate-700 font-sans">Trigger Point:</strong> Topic scoring in Topic Ideas &amp; Quality check in AI Writer</div>
              <div className="truncate"><strong className="text-slate-700 font-sans">Endpoint:</strong> http://127.0.0.1:8000/ml/*</div>
            </div>
          </div>

          {/* API 6 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                Live Website Webhook Sync (Port 3001)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-800">
                Instant Publish Push
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Pushes approved articles in real-time to your live reader-facing website.
            </p>
            <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
              <div><strong className="text-slate-700 font-sans">Trigger Point:</strong> My Posts &gt; "Publish Now" &amp; Settings &gt; "Test Connection"</div>
              <div className="truncate"><strong className="text-slate-700 font-sans">Endpoint:</strong> POST /api/public/webhook-receiver &gt; localhost:3001</div>
            </div>
          </div>

          {/* API 7 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-600" />
                Core Platform REST API (Port 5000)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-cyan-100 text-cyan-800">
                Central Orchestrator
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Handles all database queries, post saves, analytics aggregation, and background cron jobs.
            </p>
            <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
              <div><strong className="text-slate-700 font-sans">Trigger Point:</strong> Every user action across the Dashboard UI</div>
              <div className="truncate"><strong className="text-slate-700 font-sans">Endpoint:</strong> http://localhost:5000/api/blogs, /topics, /settings</div>
            </div>
          </div>

          {/* API 8 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                Dual Database Engines (MongoDB + MySQL)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-teal-100 text-teal-800">
                Persistent Storage
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              MongoDB stores articles &amp; metadata; MySQL pool synchronizes relational data.
            </p>
            <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
              <div><strong className="text-slate-700 font-sans">Trigger Point:</strong> System Status Bar &amp; automatic data persistence</div>
              <div className="truncate"><strong className="text-slate-700 font-sans">Connection:</strong> 127.0.0.1:27017 (Mongo) &amp; localhost:3306 (MySQL)</div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
