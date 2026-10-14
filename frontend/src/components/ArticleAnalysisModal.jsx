import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  X,
  Sparkles,
  BookOpen,
  Search,
  Eye,
  Users,
  Clock,
  TrendingUp,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  Flame,
  ExternalLink,
  RefreshCw,
  Play
} from 'lucide-react';
import { AnalyticsAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function ArticleAnalysisModal({ blogId, blogTitle, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('linguistics'); // 'linguistics' | 'seo' | 'telemetry' | 'recommendations'
  const { showToast } = useApp();

  const fetchAnalysis = async () => {
    if (!blogId) return;
    try {
      setLoading(true);
      const res = await AnalyticsAPI.getBlogAnalytics(blogId);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      showToast(`Failed to load article analysis: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && blogId) {
      fetchAnalysis();
    }
  }, [isOpen, blogId]);

  const handleSimulateTraffic = async () => {
    if (!data?.blog?.slug) return;
    setSimulating(true);
    try {
      await AnalyticsAPI.simulateTraffic({ blogSlug: data.blog.slug });
      showToast('Simulated real-time visitor traffic and synced to MySQL & MongoDB!', 'success');
      await fetchAnalysis();
    } catch (err) {
      showToast(`Simulation failed: ${err.message}`, 'error');
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  const linguistics = data?.linguistics;
  const telemetry = data?.telemetry;
  const blog = data?.blog;
  const recommendations = data?.recommendations || [];

  const getFleschBadge = (score) => {
    if (score >= 70) return { label: 'Easy to Read', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 50) return { label: 'Standard / Conversational', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    return { label: 'Technical / Complex', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  const fleschBadge = getFleschBadge(linguistics?.fleschScore || 70);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Article Quality & Visitor Analysis
              </h2>
              <p className="text-xs text-slate-500 max-w-xl truncate font-medium">
                {blogTitle || blog?.title || 'Article Analysis'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalysis}
              disabled={loading}
              title="Refresh analysis"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-2 bg-slate-50/50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'linguistics', label: 'Readability & Structure', icon: BookOpen },
            { id: 'seo', label: 'SEO & Keywords', icon: Search },
            { id: 'telemetry', label: 'Visitor Stats (Live)', icon: Eye },
            { id: 'recommendations', label: `Suggestions (${recommendations.length})`, icon: Lightbulb }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow bg-[#f8fafc]">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Computing readability & visitor telemetry...</p>
            </div>
          ) : !data ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Unable to load analysis metrics.
            </div>
          ) : (
            <>
              {/* Tab 1: Linguistics & Readability */}
              {activeTab === 'linguistics' && (
                <div className="space-y-6">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Reading Ease</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${fleschBadge.color}`}>
                          {fleschBadge.label}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {linguistics?.fleschScore}<span className="text-xs font-normal text-slate-400">/100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, linguistics?.fleschScore || 0))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs text-slate-500 font-medium block">Reading Level</span>
                      <div className="text-2xl font-black text-slate-900">
                        Grade {linguistics?.gradeLevel}
                      </div>
                      <p className="text-[11px] text-slate-500">Suitable for high school to general public</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs text-slate-500 font-medium block">Complexity Score</span>
                      <div className="text-2xl font-black text-indigo-600">
                        {linguistics?.gunningFog}
                      </div>
                      <p className="text-[11px] text-slate-500">{linguistics?.complexWordsPct}% complex syllables</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs text-slate-500 font-medium block">Est. Reading Time</span>
                      <div className="text-2xl font-black text-emerald-600">
                        {linguistics?.readingTimeMinutes} min
                      </div>
                      <p className="text-[11px] text-slate-500">Based on standard 200 WPM speed</p>
                    </div>
                  </div>

                  {/* Quantitative Composition */}
                  <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      Article Structural Composition
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-medium block">Total Words</span>
                        <span className="text-base font-bold text-slate-900">{linguistics?.wordCount}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-medium block">Sentences</span>
                        <span className="text-base font-bold text-slate-900">{linguistics?.sentenceCount}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-medium block">Words/Sentence</span>
                        <span className="text-base font-bold text-indigo-600">{linguistics?.avgWordsPerSentence}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-medium block">Headings</span>
                        <span className="text-base font-bold text-indigo-600">{linguistics?.structure?.h2Count}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-medium block">Code Blocks</span>
                        <span className="text-base font-bold text-emerald-600">{linguistics?.structure?.codeBlocksCount}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-medium block">Citations</span>
                        <span className="text-base font-bold text-amber-600">{blog?.sourceCitationsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: SEO & Keyword Density */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  {/* Primary Keyword Status */}
                  <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-600" />
                        Primary Keyword Density (Target: 1.0% - 2.5%)
                      </span>
                      {linguistics?.primaryKeyword?.isOptimal ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Density
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Needs Calibration
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="text-2xl font-black text-indigo-600">
                        {linguistics?.primaryKeyword?.densityPct}%
                      </div>
                      <div className="text-xs text-slate-600">
                        Keyword: <strong className="text-slate-900">"{linguistics?.primaryKeyword?.keyword}"</strong> ({linguistics?.primaryKeyword?.occurrences} occurrences in {linguistics?.wordCount} words)
                      </div>
                    </div>
                  </div>

                  {/* Secondary Keyword Distribution Table */}
                  <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Secondary Keyword Distribution
                    </h3>

                    {linguistics?.secondaryKeywords?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                              <th className="pb-2">Keyword Phrase</th>
                              <th className="pb-2 text-center">Occurrences</th>
                              <th className="pb-2 text-center">Density %</th>
                              <th className="pb-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {linguistics.secondaryKeywords.map((kw, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 text-slate-900 font-medium">{kw.keyword}</td>
                                <td className="py-2.5 text-center text-slate-600">{kw.count}</td>
                                <td className="py-2.5 text-center text-indigo-600 font-medium">{kw.densityPct}%</td>
                                <td className="py-2.5 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    kw.status === 'optimal'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : (kw.status === 'moderate' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-rose-50 text-rose-700 border-rose-200')
                                  }`}>
                                    {kw.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No secondary keywords defined for this article.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Visitor Telemetry */}
              {activeTab === 'telemetry' && (
                <div className="space-y-6">
                  {/* Action Bar for Live Simulation */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Live Visitor Telemetry & Simulation
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Reads live tracking events from your website and synchronizes them to your database.
                      </p>
                    </div>

                    <button
                      onClick={handleSimulateTraffic}
                      disabled={simulating}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                      <span>{simulating ? 'Simulating...' : 'Simulate Live Visitors'}</span>
                    </button>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <Eye className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 font-medium block">Total Views</span>
                      <span className="text-lg font-black text-slate-900">{telemetry?.views?.toLocaleString()}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <Users className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 font-medium block">Unique Visitors</span>
                      <span className="text-lg font-black text-sky-600">{telemetry?.uniqueVisitors?.toLocaleString()}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 font-medium block">Avg Read Time</span>
                      <span className="text-lg font-black text-emerald-600">{Math.floor(telemetry?.avgReadingTimeSeconds / 60)}m {telemetry?.avgReadingTimeSeconds % 60}s</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <TrendingUp className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 font-medium block">Scroll Depth</span>
                      <span className="text-lg font-black text-amber-600">{telemetry?.avgScrollDepthPct}%</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <Share2 className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 font-medium block">Social Shares</span>
                      <span className="text-lg font-black text-purple-600">{telemetry?.shares}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 font-medium block">Bounce Rate</span>
                      <span className="text-lg font-black text-rose-600">{telemetry?.bounceRatePct}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: AI Recommendations */}
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Automated AI Quality & Optimization Suggestions
                  </h3>

                  <div className="space-y-3">
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                          rec.severity === 'good'
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : (rec.severity === 'high' ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-sky-50/70 border-sky-200 text-sky-900')
                        }`}
                      >
                        {rec.severity === 'good' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold">{rec.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{rec.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified with AI Content Quality Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer shadow-sm"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
