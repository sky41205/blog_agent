import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Flame,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
  Activity,
  Zap,
  Clock,
  Compass,
  Radio,
  ExternalLink,
  Newspaper,
  Bookmark
} from 'lucide-react';
import { TopicAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const GLOBAL_REGIONS = [
  { code: 'GLOBAL', name: 'Worldwide / All Over The Globe', flag: '🌐' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' }
];

export default function TopicIntelligence() {
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'saved'
  const [selectedRegion, setSelectedRegion] = useState('GLOBAL');
  const [topics, setTopics] = useState([]);
  const [realtimeTrends, setRealtimeTrends] = useState([]);
  const [selectedRadarTrend, setSelectedRadarTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [radarLoading, setRadarLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [autoPulseActive, setAutoPulseActive] = useState(true);
  const [tickSeconds, setTickSeconds] = useState(0);

  // Custom topic form
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Finance & Fintech');
  const [customDescription, setCustomDescription] = useState('');

  const { showToast } = useApp();
  const navigate = useNavigate();
  const tickRef = useRef(null);

  const categories = [
    { id: 'All', name: 'All Categories', icon: '🌐', tags: [] },
    { id: 'finance', name: 'Finance & Fintech', icon: '💳', tags: ['Banking & UPI', 'Crypto & Web3', 'Stock Market', 'Personal Wealth', 'Venture Capital'] },
    { id: 'ngos', name: 'NGOs & Non-Profits', icon: '🤝', tags: ['Hunger Relief', 'Clean Water', 'Disaster Aid', 'CSR Governance', 'Volunteering'] },
    { id: 'technology', name: 'Technology & AI', icon: '💻', tags: ['Agentic Workflows', 'Cloud & DevOps', 'Zero Trust', 'Next.js 15', 'Quantum'] },
    { id: 'causes', name: 'Causes & Social Impact', icon: '🌱', tags: ['Climate Action', 'Miyawaki Forests', 'Stray Rescue', 'Women SHGs', 'Child Literacy'] },
    { id: 'healthcare', name: 'Healthcare & Science', icon: '🏥', tags: ['CRISPR Gene Therapy', 'Longevity Medicine', 'Medical AI', 'Space Astronomy'] },
    { id: 'trends', name: 'Business & Global Trends', icon: '📈', tags: ['Future of Work', 'D2C E-Commerce', 'Creator Economy', 'Sports Science'] }
  ];

  // 1. Fetch Real-time Radar & Predictive Assumptions by Region
  const fetchRadarTrends = async (isManual = false) => {
    try {
      if (isManual) setRadarLoading(true);
      const res = await TopicAPI.getRealtimeRadar({
        region: selectedRegion,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery,
        t: Date.now()
      });
      if (res.data?.trends && res.data.trends.length > 0) {
        setRealtimeTrends(res.data.trends);
        if (!selectedRadarTrend || isManual) {
          setSelectedRadarTrend(res.data.trends[0]);
        }
        setTickSeconds(0);
        if (isManual) showToast(`Updated live trends for ${res.data.flag || '🌐'} ${res.data.regionName || selectedRegion}!`, 'success');
      }
    } catch (err) {
      console.warn('Fetch radar trends error:', err);
    } finally {
      if (isManual) setRadarLoading(false);
    }
  };

  // 2. Fetch Saved Database Topics with live fallback & refresh support
  const fetchTopics = async (isRefresh = false) => {
    try {
      setLoading(true);
      const res = await TopicAPI.getTopics({
        region: selectedRegion,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery,
        refresh: isRefresh ? 'true' : undefined,
        t: Date.now()
      });
      if (res.data?.topics && res.data.topics.length > 0) {
        setTopics(res.data.topics);
      }
    } catch (err) {
      console.warn('Fetch topics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setRadarLoading(true);
    try {
      await Promise.allSettled([
        fetchRadarTrends(true),
        fetchTopics(true)
      ]);
    } finally {
      setRadarLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchRadarTrends();
  }, [selectedCategory, selectedRegion]);

  // 1-Second Dynamic Clock
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTickSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, []);

  // Periodic radar polling (every 12s if auto-pulse active)
  useEffect(() => {
    if (!autoPulseActive) return;
    const interval = setInterval(() => {
      fetchRadarTrends(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoPulseActive, searchQuery, selectedRegion]);

  const handleDiscoverNew = async () => {
    setDiscovering(true);
    const currRegionObj = GLOBAL_REGIONS.find(r => r.code === selectedRegion) || GLOBAL_REGIONS[0];
    showToast(`Discovering live trends across ${currRegionObj.flag} ${currRegionObj.name}...`, 'info');
    try {
      const res = await TopicAPI.discover({
        region: selectedRegion,
        niche: selectedCategory !== 'All' ? selectedCategory : 'Technology & AI',
        searchSeed: searchQuery
      });
      if (res.data?.topics) {
        setTopics(res.data.topics);
        showToast(`Discovered & analyzed ${res.data.topics.length} trends from ${res.data.flag || '🌐'} ${res.data.regionName || 'the globe'}!`, 'success');
      }
      fetchRadarTrends(false);
    } catch (err) {
      showToast(`Discovery error: ${err.message}`, 'error');
    } finally {
      setDiscovering(false);
    }
  };

  const handleSaveCustomTopic = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    try {
      await TopicAPI.create({
        title: customTitle,
        category: customCategory,
        description: customDescription,
        keywords: [customCategory.toLowerCase(), 'guide', 'tips']
      });
      showToast('Custom topic saved! Ready to write.', 'success');
      setShowAddModal(false);
      setCustomTitle('');
      setCustomDescription('');
      fetchTopics();
    } catch (err) {
      showToast(`Save error: ${err.message}`, 'error');
    }
  };

  const currentRegionInfo = GLOBAL_REGIONS.find(r => r.code === selectedRegion) || GLOBAL_REGIONS[0];

  const filteredTopics = topics.filter(t => {
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory || (t.category && t.category.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0]));
    return matchesSearch && matchesCat;
  });

  const filteredRadarTrends = realtimeTrends.filter(t => {
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.keywords && t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory || (t.category && t.category.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0]));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600 animate-spin-slow" />
            Global Trend Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Real-time trending search queries and signals from all over the globe, powered by Google Trends & ML prediction.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => handleRefreshAll()}
            disabled={radarLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh trends"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${radarLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom</span>
          </button>

          <button
            onClick={handleDiscoverNew}
            disabled={discovering}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${discovering ? 'animate-spin' : ''}`} />
            <span>{discovering ? 'Ingesting...' : 'Find New Trends'}</span>
          </button>
        </div>
      </div>

      {/* Global Region Selector Pills */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Select Region Across The Globe:</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
              Currently: {currentRegionInfo.flag} {currentRegionInfo.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Live Google Trends API Stream</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
          {GLOBAL_REGIONS.map((region) => (
            <button
              key={region.code}
              onClick={() => setSelectedRegion(region.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedRegion === region.code
                  ? 'bg-indigo-600 text-white shadow-xs scale-102'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{region.flag}</span>
              <span>{region.name.split('/')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('radar')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'radar'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Live Radar Stream ({filteredRadarTrends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'saved'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4 text-indigo-500" />
            <span>Saved Topic Pipeline ({filteredTopics.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 pb-3 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Stream Pulse: <strong className="text-slate-700">{tickSeconds}s ago</strong></span>
        </div>
      </div>

      {/* Featured Spotlight Card */}
      {selectedRadarTrend && activeTab === 'radar' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600" />
                  Top Global Trend
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {selectedRadarTrend.flag || '🌐'} {selectedRadarTrend.regionName || selectedRadarTrend.region || 'Global'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedRadarTrend.category || 'General'}
                </span>
                {selectedRadarTrend.approxTraffic && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    📈 {selectedRadarTrend.approxTraffic} Active Searches
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {selectedRadarTrend.title}
              </h2>

              {selectedRadarTrend.newsItems && selectedRadarTrend.newsItems.length > 0 && (
                <div className="pt-1 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                  <Newspaper className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">Top Headline:</span>
                  <span className="italic line-clamp-1">"{selectedRadarTrend.newsItems[0].title}"</span>
                  {selectedRadarTrend.newsItems[0].source && (
                    <span className="text-[10px] text-slate-400">({selectedRadarTrend.newsItems[0].source})</span>
                  )}
                </div>
              )}

              {selectedRadarTrend.assumptions && selectedRadarTrend.assumptions[0] && (
                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  {selectedRadarTrend.assumptions[0]}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
              {selectedRadarTrend.sourceUrl && (
                <a
                  href={selectedRadarTrend.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  title="View on Google / Source"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => navigate('/writer', { state: { selectedTopic: selectedRadarTrend } })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Write Blog on This</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
            <div>Momentum Score: <strong className="text-indigo-600 font-bold">{selectedRadarTrend.momentumScore || 88}/100</strong></div>
            <div>Search Velocity: <strong className="text-slate-900">{selectedRadarTrend.searchVelocity || '+140%/hr'}</strong></div>
            <div>Target Audience: <strong className="text-slate-900">{selectedRadarTrend.targetIntent || 'Informative Guide'}</strong></div>
            <div>SERP Capture: <strong className="text-emerald-700 font-semibold">{selectedRadarTrend.serpDifficulty || 'Low'}</strong></div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter trending queries or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name || (cat.id === 'All' && selectedCategory === 'All');
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === 'All' ? 'All' : cat.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Quick-Chips */}
      {selectedCategory !== 'All' && (
        <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            Specialized Aspects:
          </span>
          {categories.find(c => c.name === selectedCategory)?.tags.map((tag, tIdx) => (
            <button
              key={tIdx}
              onClick={() => setSearchQuery(tag)}
              className={`px-2.5 py-1 rounded-lg border text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 transition-all shrink-0 cursor-pointer ${
                searchQuery === tag ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-rose-500 hover:underline shrink-0 ml-2 font-bold"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Tab 1: Live Radar Stream Table */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          {radarLoading && realtimeTrends.length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-medium">Scanning live internet trends for {currentRegionInfo.flag} {currentRegionInfo.name}...</p>
            </div>
          ) : filteredRadarTrends.length === 0 ? (
            <div className="p-16 text-center text-slate-500 rounded-2xl bg-white border border-slate-200 space-y-3">
              <p className="text-sm font-bold text-slate-800">🌐 No live trends matching "{searchQuery}" in {currentRegionInfo.flag} {currentRegionInfo.name}</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Try switching the region above to Worldwide or click below to trigger a live ingestion stream.</p>
              <button
                onClick={handleDiscoverNew}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Scan Global Trends
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Trending Query / Topic</th>
                      <th className="py-3.5 px-4">Region</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Search Volume</th>
                      <th className="py-3.5 px-4">Momentum</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredRadarTrends.map((trend) => (
                      <tr
                        key={trend.id || trend.title}
                        onClick={() => setSelectedRadarTrend(trend)}
                        className={`hover:bg-indigo-50/40 transition-colors cursor-pointer ${selectedRadarTrend?.title === trend.title ? 'bg-indigo-50/60' : ''}`}
                      >
                        <td className="py-4 px-6 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{trend.title}</span>
                            {trend.sourceUrl && (
                              <a
                                href={trend.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-indigo-600"
                                title="Open source signal"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          {trend.newsItems && trend.newsItems.length > 0 ? (
                            <p className="text-slate-500 text-xs mt-1 line-clamp-1 italic">
                              "{trend.newsItems[0].title}"
                            </p>
                          ) : trend.assumptions && trend.assumptions[0] ? (
                            <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                              {trend.assumptions[0]}
                            </p>
                          ) : null}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                            <span>{trend.flag || '🌐'}</span>
                            <span>{trend.region || selectedRegion}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            {trend.category || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {trend.approxTraffic || `~${(trend.volume || 15000).toLocaleString()}`}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                            🔥 {trend.momentumScore || 88}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/writer', { state: { selectedTopic: trend } });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Write</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Topic Pipeline Table */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-medium">Loading saved topics...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-16 text-center text-slate-500 rounded-2xl bg-white border border-slate-200 space-y-3">
              <p className="text-sm font-bold text-slate-800">🔥 No topics found matching this filter</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Click below to find and score the latest relevant topics for your audience.</p>
              <button
                onClick={handleDiscoverNew}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Find Trending Topics
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Topic Title & Summary</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Search Interest</th>
                      <th className="py-3.5 px-4">Audience Match</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredTopics.map((topic) => (
                      <tr key={topic._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 max-w-md">
                          <h3 className="font-bold text-slate-900 text-sm">{topic.title}</h3>
                          {topic.description && (
                            <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{topic.description}</p>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            {topic.category || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            (topic.trendLevel === 'High' || topic.trendScore >= 80)
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {(topic.trendLevel === 'High' || topic.trendScore >= 80) ? '🔥 High Momentum' : 'Medium'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-700 whitespace-nowrap">
                          ⭐ {topic.relevance ? `${topic.relevance}%` : `${Math.round((topic.relevanceScore || 0.92) * 100)}%`}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => navigate('/writer', { state: { selectedTopic: topic } })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Write Blog</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Custom Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSaveCustomTopic} className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Enter Custom Topic Idea</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Simple Steps to Master Generative AI in 2026"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {categories.filter(c => c.id !== 'All').map(c => (
                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Short Summary / Outline (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what this article should cover..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Save & Start Writing
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
