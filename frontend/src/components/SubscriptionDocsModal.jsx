import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  Printer,
  Code,
  Key,
  ShieldCheck,
  Terminal,
  FileText,
  Sparkles,
  Zap,
  Globe,
  Radio,
  BookOpen,
  Send,
  Layers,
  TrendingUp,
  CreditCard,
  Users,
  Compass
} from 'lucide-react';
import { SubscriptionAPI } from '../services/api';

export default function SubscriptionDocsModal({ subscriptionId, initialSubData, isNewCreation = false, onClose }) {
  const [docsData, setDocsData] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [downloadMarkdownUrl, setDownloadMarkdownUrl] = useState('');
  const [downloadHtmlUrl, setDownloadHtmlUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quickstart'); // 'quickstart' | 'topics' | 'endpoints' | 'code' | 'webhooks' | 'markdown'
  const [activeLang, setActiveLang] = useState('curl'); // 'curl' | 'nodejs' | 'python' | 'php' | 'react'
  const [copiedSection, setCopiedSection] = useState(null);
  const [revealKey, setRevealKey] = useState(false);

  // Interactive Live Tester within Docs Modal
  const [testCategory, setTestCategory] = useState('Finance');
  const [testLimit, setTestLimit] = useState(3);
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [testResponse, setTestResponse] = useState(null);

  useEffect(() => {
    async function loadDocs() {
      if (!subscriptionId) return;
      try {
        setLoading(true);
        const res = await SubscriptionAPI.getDocs(subscriptionId);
        if (res.data?.success) {
          setDocsData(res.data.docs);
          setMarkdown(res.data.markdown);
          setPreviewUrl(res.data.previewUrl);
          setDownloadMarkdownUrl(res.data.downloadMarkdownUrl);
          setDownloadHtmlUrl(res.data.downloadHtmlUrl);
        }
      } catch (err) {
        console.error('Failed to load subscription documentation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, [subscriptionId]);

  const handleCopy = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownload = (format = 'markdown') => {
    const url = SubscriptionAPI.getDownloadUrl(subscriptionId, format);
    window.open(url, '_blank');
  };

  const handleOpenPreview = () => {
    const url = SubscriptionAPI.getPreviewUrl(subscriptionId);
    window.open(url, '_blank');
  };

  const handleRunTopicTest = async () => {
    const keyToTest = apiKey || docsData?.client?.apiKey;
    if (!keyToTest) return;
    try {
      setTestingEndpoint(true);
      setTestResponse(null);
      const res = await SubscriptionAPI.testKeyV1(
        keyToTest,
        `/api/v1/topics?category=${encodeURIComponent(testCategory)}&limit=${testLimit}`
      );
      setTestResponse(res.data);
    } catch (err) {
      setTestResponse(err.response?.data || { error: err.message });
    } finally {
      setTestingEndpoint(false);
    }
  };

  const client = docsData?.client || initialSubData || {};
  const apiKey = client.apiKey || client.key || '';
  const maskedKey = apiKey ? `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}` : '';
  const planName = client.planName || (client.plan ? client.plan.toUpperCase() : 'PRO');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Top Header Banner */}
        <div className="px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  API Subscription & Integration Documentation
                </h2>
                {isNewCreation && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Just Created & Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Personalized documentation kit generated for <strong className="text-slate-200">{client.name || client.clientName}</strong> ({client.websiteUrl})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPreview}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
              title="Open full page view in browser"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Page</span>
            </button>
            <button
              onClick={() => handleDownload('markdown')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
              title="Download as Markdown file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download .md</span>
            </button>
            <button
              onClick={() => handleDownload('html')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
              title="Download standalone HTML documentation"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>HTML Docs</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Credentials Pill Strip */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-slate-300">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-400">API Key:</span>
              <span className="font-semibold text-sky-400">
                {revealKey ? apiKey : maskedKey}
              </span>
              <button
                onClick={() => setRevealKey(!revealKey)}
                className="text-[10px] text-slate-400 hover:text-white uppercase ml-1 underline"
              >
                {revealKey ? 'Hide' : 'Reveal'}
              </button>
              <button
                onClick={() => handleCopy(apiKey, 'apiKey')}
                className="text-slate-400 hover:text-white ml-1"
                title="Copy Key"
              >
                {copiedSection === 'apiKey' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
              <span className="text-[11px] text-slate-400">Tier:</span>
              <span className="font-bold uppercase text-indigo-400">{planName}</span>
              <span className="text-[11px] text-slate-400">• Quota:</span>
              <span className="font-bold text-slate-200">
                {client.quotas?.monthlyRequests?.toLocaleString() || 5000} reqs/mo
              </span>
              <span className="font-bold text-purple-400">
                ({client.quotas?.monthlyGenerations || 15} articles)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(markdown, 'fullMarkdown')}
              className="px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              {copiedSection === 'fullMarkdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'fullMarkdown' ? 'Copied Full Markdown!' : 'Copy Full Documentation Markdown'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-900 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'quickstart', label: '🚀 Quickstart & Setup' },
            { id: 'topics', label: '🔍 Multi-Category Topic Finding' },
            { id: 'code', label: '💻 Client SDK & Code Snippets' },
            { id: 'endpoints', label: '📡 API Endpoints Catalog' },
            { id: 'webhooks', label: '⚡ Webhook Push & Security' },
            { id: 'markdown', label: '📄 Full Markdown Spec' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-white font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Compiling personalized API documentation & integration package...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: QUICKSTART */}
              {activeTab === 'quickstart' && (
                <div className="space-y-6">
                  {/* Header alert */}
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        Hand-Off Ready Documentation for {client.name || client.clientName}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        This documentation contains your live credentials, quota boundaries, topic discovery guides for multiple categories (Finance, NGOs, Technology, Causes, Trends), and ready-to-copy code snippets.
                      </p>
                    </div>
                  </div>

                  {/* Authentication block */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Authentication Header
                      </h3>
                      <button
                        onClick={() => handleCopy(`X-API-Key: ${apiKey}`, 'header')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedSection === 'header' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy Header
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Every request to the Autonomous Blogger API must supply your personal secret key in the <code>X-API-Key</code> HTTP request header.
                    </p>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-sky-300">
                      <code>X-API-Key: {apiKey}</code>
                    </div>
                  </div>

                  {/* 1-Line cURL Test */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-sky-400" />
                        1-Line cURL Verification
                      </h3>
                      <button
                        onClick={() => handleCopy(`curl -H "X-API-Key: ${apiKey}" http://localhost:5000/api/v1/account`, 'curlQuick')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedSection === 'curlQuick' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy Command
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Run this in terminal to verify your API credentials and view live quota balance:
                    </p>
                    <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto">
{`curl -X GET "http://localhost:5000/api/v1/account" \\
  -H "X-API-Key: ${apiKey}"`}
                    </pre>
                  </div>

                  {/* 1-Line Embeddable Widget */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        1-Line Website Embed (Zero-Code Live Widget)
                      </h3>
                      <button
                        onClick={() => handleCopy(docsData?.widgetEmbed?.snippet || '', 'widget')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedSection === 'widget' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy Widget Tag
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Drop this HTML snippet into {client.websiteUrl} (WordPress, Shopify, Webflow, or custom HTML) to render live published articles with zero backend coding:
                    </p>
                    <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-xs text-purple-300 overflow-x-auto">
                      {docsData?.widgetEmbed?.snippet}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 2: MULTI-CATEGORY TOPIC FINDING */}
              {activeTab === 'topics' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Compass className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white">
                        Multi-Category Topic Finding Across All Aspects
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your API subscription grants real-time programmatic access to ML-ranked trending topics across <strong>Finance & Fintech</strong>, <strong>NGOs & Non-Profits</strong>, <strong>Technology & AI</strong>, <strong>Causes & Social Impact</strong>, <strong>Healthcare & Science</strong>, and <strong>Business Trends</strong>.
                    </p>
                  </div>

                  {/* Taxonomy Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      {
                        cat: 'Finance & Fintech',
                        icon: '💳',
                        color: 'from-amber-500/10 to-transparent border-amber-500/20',
                        sub: ['Banking & UPI / CBDC', 'Crypto, Bitcoin ETF & Web3', 'Stock Market & Algo-Trading', 'Personal Wealth & Inflation']
                      },
                      {
                        cat: 'NGOs & Non-Profits',
                        icon: '🤝',
                        color: 'from-blue-500/10 to-transparent border-blue-500/20',
                        sub: ['Grassroots Hunger Relief', 'Disaster Relief & Aid', 'Rural Clean Water & Pits', 'Philanthropy & CSR Governance']
                      },
                      {
                        cat: 'Technology & AI',
                        icon: '💻',
                        color: 'from-indigo-500/10 to-transparent border-indigo-500/20',
                        sub: ['Agentic Multi-Agent Workflows', 'Cloud Computing & DevOps', 'Zero Trust & Cybersecurity', 'Modern Web (Next.js 15)']
                      },
                      {
                        cat: 'Causes & Social Impact',
                        icon: '🌱',
                        color: 'from-emerald-500/10 to-transparent border-emerald-500/20',
                        sub: ['Climate Action & Net-Zero', 'Miyawaki Urban Forests', 'Stray Animal Rescue & Care', 'Women Empowerment & SHGs']
                      },
                      {
                        cat: 'Healthcare & Science',
                        icon: '🏥',
                        color: 'from-rose-500/10 to-transparent border-rose-500/20',
                        sub: ['CRISPR & Gene Therapy', 'Longevity Medicine', 'Medical AI Diagnostics', 'Space Astronomy & James Webb']
                      },
                      {
                        cat: 'Business & Global Trends',
                        icon: '📈',
                        color: 'from-purple-500/10 to-transparent border-purple-500/20',
                        sub: ['Future of Work & Hybrid Fleets', 'D2C E-Commerce Logistics', 'Creator Economy Subscriptions', 'Sports Science & Wearables']
                      }
                    ].map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl bg-gradient-to-b ${item.color} bg-slate-950 border`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-bold text-white text-xs">{item.cat}</span>
                        </div>
                        <ul className="space-y-1">
                          {item.sub.map((s, sIdx) => (
                            <li key={sIdx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-600" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Test Runner */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        Interactive Live Topic Finder Tester
                      </h4>
                      <span className="text-[11px] text-slate-400">Endpoint: <code>GET /api/v1/topics</code></span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Select Category:</label>
                        <select
                          value={testCategory}
                          onChange={(e) => setTestCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Finance">Finance & Fintech (Banking, Crypto, Markets)</option>
                          <option value="NGOs">NGOs & Non-Profits (Charity, Slums, Aid)</option>
                          <option value="Technology">Technology & AI (Agents, Cloud, Security)</option>
                          <option value="Causes">Causes & Social Impact (Climate, Animals, Women)</option>
                          <option value="Healthcare">Healthcare & Science (Biotech, Space)</option>
                          <option value="Trends">Business & Global Trends (Work, D2C)</option>
                          <option value="All">All Categories</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Result Limit:</label>
                        <select
                          value={testLimit}
                          onChange={(e) => setTestLimit(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value={3}>3 Topics</option>
                          <option value={5}>5 Topics</option>
                          <option value={10}>10 Topics</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={handleRunTopicTest}
                          disabled={testingEndpoint}
                          className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                        >
                          {testingEndpoint ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Querying...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Test /api/v1/topics</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {testResponse && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Live Response: HTTP 200 OK</span>
                          <button
                            onClick={() => handleCopy(JSON.stringify(testResponse, null, 2), 'testRes')}
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            {copiedSection === 'testRes' ? 'Copied!' : 'Copy JSON'}
                          </button>
                        </div>
                        <pre className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-xs text-sky-300 max-h-64 overflow-y-auto">
                          {JSON.stringify(testResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CODE SNIPPETS */}
              {activeTab === 'code' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {[
                        { id: 'curl', label: 'cURL' },
                        { id: 'nodejs', label: 'Node.js / JS' },
                        { id: 'python', label: 'Python' },
                        { id: 'php', label: 'PHP / WordPress' },
                        { id: 'react', label: 'React / Next.js' }
                      ].map(l => (
                        <button
                          key={l.id}
                          onClick={() => setActiveLang(l.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeLang === l.id
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleCopy(docsData?.codeSnippets?.[activeLang] || '', 'codeBlock')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      {copiedSection === 'codeBlock' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Snippet</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-slate-300">
                    <pre>{docsData?.codeSnippets?.[activeLang] || '// Loading snippet...'}</pre>
                  </div>
                </div>
              )}

              {/* TAB 4: ENDPOINTS CATALOG */}
              {activeTab === 'endpoints' && (
                <div className="space-y-4">
                  {docsData?.endpoints?.map((ep) => (
                    <div key={ep.id} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {ep.method}
                          </span>
                          <code className="text-sm font-bold text-white">{ep.path}</code>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400">{ep.title}</span>
                      </div>

                      <p className="text-xs text-slate-400">{ep.description}</p>

                      {ep.params?.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                            <thead className="bg-slate-900 text-slate-300 text-[11px] uppercase">
                              <tr>
                                <th className="p-2">Param</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Required</th>
                                <th className="p-2">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-400">
                              {ep.params.map((p, pIdx) => (
                                <tr key={pIdx}>
                                  <td className="p-2 font-mono text-sky-400">{p.name}</td>
                                  <td className="p-2 font-mono text-slate-500">{p.type}</td>
                                  <td className="p-2 font-semibold text-slate-300">{p.required ? 'Yes' : 'No'}</td>
                                  <td className="p-2">{p.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {ep.bodyExample && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 mb-1">Request Body (JSON):</div>
                          <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto">
                            {JSON.stringify(ep.bodyExample, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 mb-1">Example Response:</div>
                        <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-xs text-sky-300 max-h-48 overflow-y-auto">
                          {JSON.stringify(ep.responseExample, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: WEBHOOKS */}
              {activeTab === 'webhooks' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Real-Time Autonomous Article Dispatch
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Whenever the autonomous AI writer finishes generating and fact-verifying a blog post, it immediately dispatches an HTTP POST payload to your configured webhook URL.
                    </p>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div><strong className="text-slate-300">Configured URL:</strong> <span className="font-mono text-sky-400">{client.webhookUrl || 'Not configured (add in Subscriptions panel)'}</span></div>
                      <div><strong className="text-slate-300">Webhook Secret:</strong> <span className="font-mono text-amber-400">{client.webhookSecret}</span></div>
                      <div><strong className="text-slate-300">Signature Header:</strong> <span className="font-mono text-slate-400">X-Blogger-Signature</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                    <h4 className="text-sm font-bold text-white">HMAC-SHA256 Signature Verification (Node.js)</h4>
                    <pre className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto">
                      {docsData?.webhooks?.verificationExampleNode}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 6: FULL MARKDOWN SPEC */}
              {activeTab === 'markdown' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Complete documentation markdown ready to be committed into git repositories or README.md</span>
                    <button
                      onClick={() => handleCopy(markdown, 'rawMd')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedSection === 'rawMd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Raw Markdown</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 p-5 rounded-2xl font-mono text-xs text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                    {markdown}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Autonomous Blogger API • Documentation Engine v2.0 • Grounded by Google Cloud Vertex AI
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPreview}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Printable Web Docs</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
