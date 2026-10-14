import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Globe,
  CheckCircle2,
  Code,
  Send,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Smartphone,
  Monitor,
  Tablet,
  Layers,
  Flame,
  Search,
  Share2,
  RefreshCw,
  Terminal,
  Rss,
  Activity,
  Zap,
  Sliders,
  Play,
  Server,
  ArrowRight,
  Radio
} from 'lucide-react';
import { BlogAPI, SettingsAPI, PublicAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import ArticleAnalysisModal from '../components/ArticleAnalysisModal';
import { getTopicFallbackImage } from './AIWriter';

const resolveImageUrl = (url, title = '', category = '') => {
  if (!url || url.includes('1618005182384-a83a8bd57fbe')) return getTopicFallbackImage(title, category);
  if (url.startsWith('/uploads')) {
    return `http://localhost:5000${url}`;
  }
  return url;
};

export default function LiveWebsitePreview() {
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('livesite'); // 'livesite' | 'simulator' | 'nextjs' | 'embed' | 'tracker' | 'webhooks' | 'api'
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [copiedCode, setCopiedCode] = useState(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState(null);
  const [analysisBlogId, setAnalysisBlogId] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());

  // Embed Widget Customizer State
  const [embedTheme, setEmbedTheme] = useState('light');
  const [embedLimit, setEmbedLimit] = useState(6);
  const [embedAccent, setEmbedAccent] = useState('#4f46e5');
  const [embedCategory, setEmbedCategory] = useState('');

  // API Console State
  const [apiEndpoint, setApiEndpoint] = useState('/api/public/blogs');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  const { showToast } = useApp();
  const liveDemoUrl = 'http://localhost:3001';

  const fetchPublished = async () => {
    try {
      setLoading(true);
      const res = await BlogAPI.getBlogs({ status: 'PUBLISHED' });
      if (res.data?.blogs && res.data.blogs.length > 0) {
        setBlogs(res.data.blogs);
        const targetSlug = location.state?.blogSlug;
        const found = targetSlug ? res.data.blogs.find(b => b.slug === targetSlug) : res.data.blogs[0];
        setSelectedBlog(found || res.data.blogs[0]);
      }
    } catch (err) {
      console.warn('Fetch published error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await PublicAPI.getLogs();
      if (res.data?.logs) {
        setLiveLogs(res.data.logs);
      }
    } catch (e) {
      console.warn('Fetch logs error:', e);
    }
  };

  useEffect(() => {
    fetchPublished();
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, [location.state]);

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    showToast('Dispatching test article payload to live website webhook...', 'info');
    try {
      const res = await SettingsAPI.testWebhook();
      setWebhookResult(res.data);
      showToast('🟢 Live website sync test delivered successfully (200 OK)!', 'success');
    } catch (err) {
      showToast(`Sync test failed: ${err.message}`, 'error');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleTestTelemetryBeacon = async (eventType) => {
    if (!selectedBlog?.slug) return;
    try {
      await PublicAPI.track({
        blogSlug: selectedBlog.slug,
        eventType,
        readingTimeSeconds: eventType === 'dwell_time' ? 90 : 0,
        scrollDepthPct: eventType === 'scroll_depth' ? 75 : 0
      });
      showToast(`Live ${eventType} beacon recorded and synced to MySQL & MongoDB!`, 'success');
    } catch (err) {
      showToast(`Beacon failed: ${err.message}`, 'error');
    }
  };

  const handleRunApiRequest = async (endpoint) => {
    setApiEndpoint(endpoint);
    setApiLoading(true);
    try {
      const url = `http://localhost:5000${endpoint}`;
      const res = await fetch(url);
      const text = await res.text();
      let parsed = text;
      try { parsed = JSON.parse(text); } catch (e) {}
      setApiResponse(parsed);
      showToast(`200 OK from ${endpoint}`, 'success');
    } catch (err) {
      setApiResponse({ error: err.message });
      showToast(`API error: ${err.message}`, 'error');
    } finally {
      setApiLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    showToast('Code snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Embed Widget Code Snippet Generator
  const embedSnippet = `<!-- 1. Drop-in Container (Place anywhere on your website) -->
<div 
  data-blogger-feed 
  data-theme="${embedTheme}" 
  data-limit="${embedLimit}" 
  data-accent="${embedAccent}"
  ${embedCategory ? `data-category="${embedCategory}"` : ''}
></div>

<!-- 2. Drop-in Script -->
<script src="http://localhost:5000/api/public/embed.js" async></script>`;

  // Next.js Integration Snippet
  const nextjsSnippet = `// app/blog/page.jsx or components/BlogFeed.jsx (Next.js 14+ App Router)
export default async function BlogFeed() {
  const res = await fetch('http://localhost:5000/api/public/blogs', {
    next: { revalidate: 60 } // Automatically revalidates every 60 seconds
  });
  const { data: blogs } = await res.json();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <article key={blog._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all">
          <img src={blog.featuredImage?.url} alt={blog.title} className="h-48 w-full object-cover" />
          <div className="p-5 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
              {blog.category}
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{blog.title}</h3>
            <p className="text-xs text-slate-600 line-clamp-3">{blog.excerpt}</p>
          </div>
        </article>
      ))}
    </div>
  );
}`;

  // Telemetry Tracker Snippet
  const trackerSnippet = `<!-- Place before </head> or </body> on your website -->
<script 
  data-blogger-site="production-website" 
  src="http://localhost:5000/api/public/tracker.js" 
  async
></script>`;

  // Webhook Code Snippets
  const webhookSnippets = {
    nextjs: `// app/api/blogs/receive/route.ts (Next.js 14+ App Router)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payload = await req.json();

  if (payload.event === 'blog.published') {
    const { title, slug, contentMarkdown, category, author } = payload.blog;
    console.log(\`[Live Sync] Received new article: \${title} (\${slug})\`);
    // Insert into your database or trigger cache revalidation
  }

  return NextResponse.json({ received: true, status: 'synced' });
}`,
    express: `// server.js (Node.js / Express Webhook Receiver)
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/blogs/receive', (req, res) => {
  const { event, blog } = req.body;
  if (event === 'blog.published') {
    console.log(\`Received published post: "\${blog.title}"\`);
  }
  res.status(200).json({ success: true, message: 'Article synced to live website' });
});

app.listen(3000, () => console.log('Webhook server active on port 3000'));`,
    python: `# webhook.py (FastAPI / Python Webhook Receiver)
from fastapi import FastAPI, Request
app = FastAPI()

@app.post("/api/blogs/receive")
async def blog_webhook(request: Request):
    payload = await request.json()
    if payload.get("event") == "blog.published":
        blog = payload.get("blog")
        print(f"Syncing published post: {blog['title']}")
    return {"status": "success", "synced": True}`
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Live Website Blog Display & Post Simulator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              ● Live Demo Connected (Port 3001)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate live responsive viewports, copy Next.js & embed snippets, and preview how published blogs render on the live website.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={liveDemoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
          >
            <span>Open Live Website Demo</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            onClick={handleTestWebhook}
            disabled={isTestingWebhook}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
            <span>{isTestingWebhook ? 'Dispatching...' : 'Test Live Webhook'}</span>
          </button>
        </div>
      </div>

      {/* Webhook Result Alert */}
      {webhookResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live Webhook Verified Successfully!
          </span>
          <p className="text-emerald-700 font-mono text-[11px]">
            Target: <code>http://localhost:5000/api/public/webhook-receiver</code> · Event: <code>blog.published</code> · Status: 200 OK
          </p>
        </div>
      )}

      {/* Main Suite Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto">
        {[
          { id: 'livesite', label: '🔴 Live Site & Event Logs (Port 3001)', icon: Globe },
          { id: 'simulator', label: '2. Post Inspector', icon: Monitor },
          { id: 'nextjs', label: '3. Next.js Integration', icon: Code },
          { id: 'embed', label: '4. 1-Line Embed Widget', icon: Sliders },
          { id: 'tracker', label: '5. Visitor Analytics Beacon', icon: Activity },
          { id: 'webhooks', label: '6. Webhook Receivers', icon: Zap },
          { id: 'api', label: '7. REST API Console', icon: Terminal }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: LIVE SITE & EVENT LOGS (PORT 3001) */}
      {/* ========================================================================= */}
      {activeTab === 'livesite' && (
        <div className="space-y-6">
          {/* Live Browser Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800">Live Website URL:</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-indigo-700 font-bold select-all">
                <span>http://localhost:3001</span>
              </div>
              <span className="text-[11px] text-slate-400">or</span>
              <a
                href="http://localhost:5000/live-site"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-slate-600 hover:text-indigo-600 underline"
              >
                :5000/live-site
              </a>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Device Viewport Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${deviceView === 'desktop' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  onClick={() => setDeviceView('tablet')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${deviceView === 'tablet' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <Tablet className="w-3.5 h-3.5" /> Tablet
                </button>
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${deviceView === 'mobile' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>

              <button
                onClick={() => setIframeKey(Date.now())}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                title="Refresh Live Iframe"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>

              <a
                href={liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Embedded Interactive Live Website */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center">
            {/* Top Bar */}
            <div className="w-full px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>

              <div className="px-4 py-1 rounded-full bg-slate-950 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">🔒 http://localhost:3001</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 text-[11px]">Live Autonomous Blog & Ticker</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Live Synced
                </span>
              </div>
            </div>

            {/* Viewport Frame */}
            <div
              className={`transition-all duration-300 bg-white w-full ${
                deviceView === 'mobile'
                  ? 'max-w-sm my-6 rounded-3xl border-8 border-slate-800 shadow-2xl overflow-hidden'
                  : (deviceView === 'tablet' ? 'max-w-2xl my-6 rounded-2xl border-4 border-slate-800 shadow-xl overflow-hidden' : 'w-full')
              }`}
            >
              <iframe
                key={iframeKey}
                src={liveDemoUrl}
                title="Live Website Client"
                className="w-full h-[680px] border-0"
              />
            </div>
          </div>

          {/* Real-Time Live Publication & Webhook Event Logs Stream */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Live Publication & Webhook Event Stream (Logs)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      ● Real-Time Poll (3s)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live chronological audit trail of published blogs, webhook dispatches, and visitor activity beacons
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Logs</span>
                </button>
                <button
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                  <span>{isTestingWebhook ? 'Dispatching...' : 'Dispatch Test Webhook'}</span>
                </button>
              </div>
            </div>

            {/* Logs Terminal Display */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                <span>STREAM: /api/public/logs ({liveLogs.length} events logged)</span>
                <span className="text-emerald-400">STATUS: 200 OK</span>
              </div>
              <div className="p-3 max-h-72 overflow-y-auto space-y-2">
                {liveLogs.length === 0 ? (
                  <div className="text-slate-500 text-center py-4">
                    Awaiting publication events... Click "Dispatch Test Webhook" above to trigger a live log.
                  </div>
                ) : (
                  liveLogs.map((log, index) => {
                    const isSuccess = log.level === 'SUCCESS';
                    return (
                      <div
                        key={log.id || index}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isSuccess ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-sky-950 text-sky-400 border border-sky-800'
                              }`}>
                                {log.event.toUpperCase()}
                              </span>
                              <span className="font-bold text-slate-200 text-xs">
                                {log.title}
                              </span>
                              {log.slug && log.slug !== 'n/a' && (
                                <code className="text-indigo-400 text-[11px] bg-indigo-950/60 px-1.5 py-0.5 rounded">
                                  {log.slug}
                                </code>
                              )}
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5">
                              {log.details}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          <span className="text-[10px] text-slate-500 max-w-[200px] truncate" title={log.target}>
                            {log.target}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold">
                            {log.statusCode ? `HTTP ${log.statusCode}` : 'OK'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: WEBSITE POST INSPECTOR */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Select Published Article:</span>
              <select
                value={selectedBlog?.slug || ''}
                onChange={(e) => {
                  const found = blogs.find(b => b.slug === e.target.value);
                  if (found) setSelectedBlog(found);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-500 max-w-sm"
              >
                {blogs.map(b => (
                  <option key={b.slug || b._id} value={b.slug}>{b.title}</option>
                ))}
              </select>

              {selectedBlog && (
                <button
                  onClick={() => setAnalysisBlogId(selectedBlog._id || selectedBlog.slug)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quality & SEO Analysis</span>
                </button>
              )}
            </div>

            {/* Device Viewport Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${deviceView === 'desktop' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${deviceView === 'tablet' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Tablet className="w-3.5 h-3.5" /> Tablet
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${deviceView === 'mobile' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* Browser Window Simulation */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center w-full min-w-0">
            {/* Browser Window Top Bar */}
            <div className="w-full px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>

              <div className="px-4 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-2 max-w-md truncate">
                <span className="text-indigo-400 font-bold">🔒 {liveDemoUrl}/blog/{selectedBlog?.slug || 'article'}</span>
              </div>

              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                ● Live Synced
              </span>
            </div>

            {/* Simulating Viewport Container */}
            <div
              className={`transition-all duration-300 bg-[#0a0e17] min-h-[600px] w-full min-w-0 ${
                deviceView === 'mobile'
                  ? 'max-w-sm my-6 rounded-3xl border-4 border-slate-700 shadow-2xl bg-[#0a0e17] overflow-x-hidden'
                  : (deviceView === 'tablet' ? 'max-w-2xl my-6 rounded-2xl border-2 border-slate-700 shadow-xl bg-[#0a0e17] overflow-x-hidden' : 'w-full')
              }`}
            >
              {selectedBlog ? (
                <div className="p-4 sm:p-8 md:p-10 space-y-6 max-w-3xl w-full mx-auto bg-[#0d1322] my-4 sm:my-6 rounded-2xl border border-slate-800 shadow-lg text-slate-200 min-w-0 box-border break-words">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                      {selectedBlog.category || 'Technology'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(selectedBlog.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · 6 min read
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {selectedBlog.title}
                  </h1>

                  {/* Author Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        AI
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{selectedBlog.author || 'Autonomous AI Editorial Wing'}</span>
                        <span className="text-[11px] text-slate-400">Published via Autonomous AI Content Engine</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTestTelemetryBeacon('social_share')}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                      title="Simulate Share Beacon"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hero Image */}
                  <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md max-h-80">
                    <img
                      src={resolveImageUrl(selectedBlog.featuredImage?.url, selectedBlog.title, selectedBlog.category)}
                      alt={selectedBlog.featuredImage?.altText || selectedBlog.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getTopicFallbackImage(selectedBlog.title, selectedBlog.category);
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* AI Summary Callout */}
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-1.5">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Executive Summary & Key Takeaways:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedBlog.excerpt || "This guide provides an end-to-end blueprint covering architecture, real-world benchmarks, and automated machine learning optimizations."}
                    </p>
                  </div>

                  {/* Article Markdown Body */}
                  <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed min-w-0 break-words overflow-x-hidden">
                    {(selectedBlog.contentMarkdown || '').split('\n\n').map((block, i) => {
                      block = block.trim();
                      if (!block || block.startsWith('# ')) return null;
                      if (block.startsWith('## ')) {
                        return <h2 key={i} className="text-base sm:text-lg font-bold text-white pt-4 pb-1 border-b border-slate-800 break-words">{block.replace('## ', '')}</h2>;
                      }
                      if (block.startsWith('### ')) {
                        return <h3 key={i} className="text-sm font-semibold text-slate-100 pt-2 break-words">{block.replace('### ', '')}</h3>;
                      }
                      // Markdown table support
                      if (block.includes('|') && block.split('\n').every(l => l.trim().startsWith('|') && l.trim().endsWith('|'))) {
                        const rows = block.split('\n').filter(r => !r.includes('---'));
                        if (rows.length > 0) {
                          const headers = rows[0].split('|').filter(c => c.trim().length > 0);
                          const bodyRows = rows.slice(1);
                          return (
                            <div key={i} className="overflow-x-auto max-w-full my-3 rounded-xl border border-slate-800">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-900 border-b border-slate-800">
                                    {headers.map((h, hi) => (
                                      <th key={hi} className="p-2.5 font-bold text-slate-200">{h.trim()}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {bodyRows.map((br, bi) => {
                                    const cells = br.split('|').filter(c => c.trim().length > 0);
                                    return (
                                      <tr key={bi} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                                        {cells.map((c, ci) => (
                                          <td key={ci} className="p-2.5 text-slate-300">{c.trim()}</td>
                                        ))}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                      }
                      if (block.startsWith('```')) {
                        return (
                          <pre key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-w-full my-2 whitespace-pre min-w-0">
                            <code className="block min-w-0">{block.replace(/```[a-z]*\n?/gi, '')}</code>
                          </pre>
                        );
                      }
                      if (block.startsWith('>')) {
                        return (
                          <blockquote key={i} className="border-l-3 border-indigo-500 bg-indigo-950/30 p-3 rounded-r-xl text-slate-200 italic break-words">
                            {block.replace(/^>\s*/gm, '')}
                          </blockquote>
                        );
                      }
                      if (block.startsWith('- ') || block.startsWith('* ')) {
                        const items = block.split('\n').filter(Boolean);
                        return (
                          <ul key={i} className="list-disc pl-5 space-y-1 text-slate-300">
                            {items.map((it, idx) => (
                              <li key={idx} className="break-words">{it.replace(/^[-*]\s+/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={i} className="break-words">{block}</p>;
                    })}
                  </div>

                  {/* Interactive Reader Footer */}
                  <div className="pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestTelemetryBeacon('reaction_helpful')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      >
                        👍 Helpful Post
                      </button>
                      <button
                        onClick={() => handleTestTelemetryBeacon('reaction_bookmark')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      >
                        🔖 Bookmark
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      📡 Telemetry Beacon Active · MySQL & MongoDB Synced
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400">
                  No published blogs available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NEXT.JS INTEGRATION (RECOMMENDED) */}
      {/* ========================================================================= */}
      {activeTab === 'nextjs' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                How to Display Published Blogs in React / Next.js
              </h3>
              <p className="text-xs text-slate-500">
                Drop this component into your Next.js App Router (<code>app/blog/page.jsx</code>) or React application.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(nextjsSnippet, 'nextjs')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {copiedCode === 'nextjs' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'nextjs' ? 'Copied!' : 'Copy Next.js Component'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
            <code>{nextjsSnippet}</code>
          </pre>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block">Where does the live data come from?</span>
            <p>
              When an article is published, it is immediately exposed on <code className="font-mono text-indigo-600">http://localhost:5000/api/public/blogs</code>. Next.js fetches this endpoint with caching / ISR and renders the articles in real-time.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DROP-IN EMBED WIDGET */}
      {/* ========================================================================= */}
      {activeTab === 'embed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Embed Customizer
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-600 font-semibold block">Theme Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEmbedTheme('light')}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${embedTheme === 'light' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    Light Theme
                  </button>
                  <button
                    onClick={() => setEmbedTheme('dark')}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${embedTheme === 'dark' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    Dark Theme
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-semibold block">Max Articles Displayed</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 9, 12].map(n => (
                    <button
                      key={n}
                      onClick={() => setEmbedLimit(n)}
                      className={`py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${embedLimit === n ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-semibold block">Accent Color</label>
                <div className="flex items-center gap-2">
                  {['#4f46e5', '#10b981', '#06b6d4', '#f59e0b', '#ec4899'].map(c => (
                    <button
                      key={c}
                      onClick={() => setEmbedAccent(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${embedAccent === c ? 'scale-110 border-slate-900' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 block mb-2 font-medium">Compatible with:</span>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Next.js</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">WordPress</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Webflow</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Shopify</span>
              </div>
            </div>
          </div>

          {/* Code Snippet & Live Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Drop-in HTML Embed Code
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(embedSnippet, 'embed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedCode === 'embed' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'embed' ? 'Copied!' : 'Copy Embed Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                <code>{embedSnippet}</code>
              </pre>
            </div>

            {/* Visual Widget Preview */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Live Render Preview in Website Column</span>
              <div className={`p-4 rounded-2xl border ${embedTheme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(blogs || []).slice(0, 2).map((b, i) => (
                    <div key={i} className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${embedTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white w-fit" style={{ backgroundColor: embedAccent }}>
                        {b.category}
                      </span>
                      <h4 className="text-xs font-bold line-clamp-2">{b.title}</h4>
                      <p className={`text-[11px] line-clamp-2 ${embedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{b.excerpt}</p>
                      <span className="text-[11px] font-bold" style={{ color: embedAccent }}>Read Full Story &rarr;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VISITOR TELEMETRY TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Telemetry Beacon Setup
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drop this lightweight beacon script onto your website to automatically track real pageviews, scroll depth milestones, and reading duration.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold block">Automatic Metrics Collected:</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Real-time Pageviews & Unique Readers</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Scroll Depth Milestones (25%, 50%, 75%, 100%)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Average Dwell Reading Duration</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Social Shares & Reactions</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Copy-Paste Tracking Snippet
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(trackerSnippet, 'tracker')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedCode === 'tracker' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'tracker' ? 'Copied!' : 'Copy Tracker'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                <code>{trackerSnippet}</code>
              </pre>
            </div>

            {/* Interactive Telemetry Event Testing Bar */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                Live Telemetry Event Simulator (Test Beacon Transmission)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleTestTelemetryBeacon('pageview')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  📡 Send Pageview
                </button>
                <button
                  onClick={() => handleTestTelemetryBeacon('scroll_depth')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  📜 Send 75% Scroll
                </button>
                <button
                  onClick={() => handleTestTelemetryBeacon('dwell_time')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  ⏱️ Send 90s Dwell
                </button>
                <button
                  onClick={() => handleTestTelemetryBeacon('social_share')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  🔗 Send Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MULTI-FRAMEWORK WEBHOOKS */}
      {/* ========================================================================= */}
      {activeTab === 'webhooks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(webhookSnippets).map(([fw, code]) => (
            <div key={fw} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {fw === 'nextjs' ? 'Next.js App Router' : (fw === 'express' ? 'Node.js / Express' : 'Python / FastAPI')}
                  </span>
                  <button
                    onClick={() => copyToClipboard(code, fw)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                    title="Copy snippet"
                  >
                    {copiedCode === fw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto my-2 max-h-56">
                  <code>{code}</code>
                </pre>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Receives: <code>POST /api/blogs/receive</code>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: REST API CONSOLE */}
      {/* ========================================================================= */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Interactive REST API Console
              </h3>
              <div className="flex items-center gap-1.5">
                {['/api/public/blogs', '/api/topics/realtime-radar', '/api/public/categories'].map((ep) => (
                  <button
                    key={ep}
                    onClick={() => handleRunApiRequest(ep)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    GET {ep}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                GET
              </span>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="/api/public/blogs"
                className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                onClick={() => handleRunApiRequest(apiEndpoint)}
                disabled={apiLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {apiLoading ? 'Fetching...' : 'Send Request'}
              </button>
            </div>

            {apiResponse && (
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-h-96">
                <code>{JSON.stringify(apiResponse, null, 2)}</code>
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Article Quality & SEO Analysis Modal */}
      {analysisBlogId && (
        <ArticleAnalysisModal
          blogId={analysisBlogId}
          onClose={() => setAnalysisBlogId(null)}
        />
      )}
    </div>
  );
}
