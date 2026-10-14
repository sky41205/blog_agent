import React, { useState, useEffect } from 'react';
import {
  Globe,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  X,
  Sparkles,
  Check,
  Radio,
  Copy,
  Code,
  Rss,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Server
} from 'lucide-react';
import { BlogAPI, SettingsAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function LivePostModal({ blog, isOpen, onClose, onPublished }) {
  if (!isOpen || !blog) return null;

  const { showToast } = useApp();

  // Publishing Options
  const [timing, setTiming] = useState('immediate'); // 'immediate' | 'scheduled'
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [target, setTarget] = useState('itlc_foundation'); // 'itlc_foundation' | 'live_demo' | 'custom_webhook' | 'wordpress'
  const [customWebhookUrl, setCustomWebhookUrl] = useState('http://localhost:5000/api/public/webhook-receiver');

  // WordPress config
  const [wpUrl, setWpUrl] = useState('https://my-wordpress-site.com');
  const [wpUser, setWpUser] = useState('admin');
  const [wpPassword, setWpPassword] = useState('');

  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState(null);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const liveDemoArticleUrl = `http://localhost:3001`;
  const publicBlogUrl = `http://localhost:5000/api/public/blogs/${blog.slug || 'article'}`;
  const embedCode = `<div data-blogger-feed data-limit="6"></div>\n<script src="http://localhost:5000/api/public/embed.js" async></script>`;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const handlePost = async () => {
    setIsPosting(true);
    showToast('Publishing blog to destination...', 'info');
    try {
      const res = await BlogAPI.postToLiveWebsite(blog._id || blog.id || blog.slug, {
        title: blog.title,
        category: blog.category,
        contentMarkdown: blog.contentMarkdown,
        excerpt: blog.excerpt,
        featuredImage: blog.featuredImage,
        seo: blog.seo,
        target,
        timing,
        scheduledPublishTime: timing === 'scheduled' ? scheduledDate : null,
        customTargetUrl: target === 'itlc_foundation' ? 'https://itlcfoundation.com/api/blogs/receive' : (target === 'custom_webhook' ? customWebhookUrl : 'http://localhost:5000/api/public/webhook-receiver'),
        wpConfig: target === 'wordpress' ? { wpUrl, username: wpUser, appPassword: wpPassword } : null
      });

      setPostResult(res.data);
      const destName = target === 'itlc_foundation' ? 'ITLC Foundation Hub' : (target === 'live_demo' ? 'Live Website Demo' : 'Custom Webhook');
      showToast(`🎉 Blog successfully published to ${destName}!`, 'success');
      if (onPublished) onPublished(res.data?.blog || blog);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Publish Article to Live Website</h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                "{blog.title}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          {postResult ? (
            /* Success View */
            <div className="py-4 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">🎉 Published Successfully!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your blog post is now live on the public feed and synced with the live website demo.
                </p>
              </div>

              {/* Live Links */}
              <div className="space-y-2 text-left">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-700" />
                      Live Website Demo Portal:
                    </span>
                    <a
                      href={liveDemoArticleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Open Live Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="p-2 bg-white border border-emerald-200/60 rounded-lg text-[11px] font-mono text-slate-700 truncate">
                    {liveDemoArticleUrl}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">Public REST API Feed:</span>
                  <div className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700">
                    <span className="truncate">{publicBlogUrl}</span>
                    <button
                      onClick={() => handleCopy(publicBlogUrl, 'publicUrl')}
                      className="shrink-0 p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedKey === 'publicUrl' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={liveDemoArticleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors text-xs shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Live on Website</span>
                </a>

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <>
              {/* 1. Destination Choice */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block text-xs">
                  1. Choose Publishing Destination
                </label>

                <div className="space-y-2.5">
                  {/* Destination 1: ITLC Foundation Hub */}
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      target === 'itlc_foundation'
                        ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="target"
                      checked={target === 'itlc_foundation'}
                      onChange={() => setTarget('itlc_foundation')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          🌳 ITLC Foundation Hub (itlcfoundation.com)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Primary Live NGO
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Publishes directly to the official <strong>ITLC Foundation Hub</strong> (Lucknow Environment, Animal Welfare & Social Relief).
                      </p>
                    </div>
                  </label>

                  {/* Destination 2: Live Demo Website */}
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      target === 'live_demo'
                        ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="target"
                      checked={target === 'live_demo'}
                      onChange={() => setTarget('live_demo')}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-indigo-600" />
                          🌐 Live Website Demo & Public REST Feed
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                          Port 3001
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Publishes immediately to the local live website demo at <strong>http://localhost:3001</strong> and exposes the article via <code>/api/public/blogs</code>.
                      </p>
                    </div>
                  </label>

                  {/* Destination 3: Custom Webhook Push */}
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      target === 'custom_webhook'
                        ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="target"
                      checked={target === 'custom_webhook'}
                      onChange={() => setTarget('custom_webhook')}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div className="space-y-1 flex-grow">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        ⚡ Production Webhook Push
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Dispatches the full JSON payload with markdown, meta tags, and images to your production server endpoint.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom Webhook URL input if selected */}
              {target === 'custom_webhook' && (
                <div className="space-y-1.5 pt-2">
                  <label className="font-bold text-slate-700 block">Webhook Destination URL</label>
                  <input
                    type="url"
                    value={customWebhookUrl}
                    onChange={(e) => setCustomWebhookUrl(e.target.value)}
                    placeholder="https://your-site.com/api/blogs/receive"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* 2. When to Publish */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block text-xs">
                  2. Publishing Timing
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTiming('immediate')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      timing === 'immediate'
                        ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900 block">⚡ Publish Right Now</span>
                    <span className="text-[11px] text-slate-500">Goes live immediately</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTiming('scheduled')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      timing === 'scheduled'
                        ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900 block">⏰ Schedule for Later</span>
                    <span className="text-[11px] text-slate-500">Auto-publish on chosen date</span>
                  </button>
                </div>

                {timing === 'scheduled' && (
                  <div className="pt-2">
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium w-full"
                    />
                  </div>
                )}
              </div>

              {/* 3. Drop-in Help Accordion */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIntegrations(!showIntegrations)}
                  className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    How to display published blogs on your own website?
                  </span>
                  {showIntegrations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showIntegrations && (
                  <div className="p-4 mt-2 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-indigo-600" />
                        Method A: 1-Line Drop-in HTML Embed Widget
                      </span>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                        <span className="truncate">&lt;script src="http://localhost:5000/api/public/embed.js"&gt;&lt;/script&gt;</span>
                        <button
                          onClick={() => handleCopy(embedCode, 'embedCode')}
                          className="shrink-0 p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                        >
                          {copiedKey === 'embedCode' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        Method B: Headless Next.js REST API
                      </span>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                        <span className="truncate">GET http://localhost:5000/api/public/blogs</span>
                        <button
                          onClick={() => handleCopy('http://localhost:5000/api/public/blogs', 'apiFeed')}
                          className="shrink-0 p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                        >
                          {copiedKey === 'apiFeed' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!postResult && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handlePost}
              disabled={isPosting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPosting ? 'Publishing...' : 'Confirm & Publish Live'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
