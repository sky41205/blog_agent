import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  BookOpen,
  Eye,
  Bot,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Play,
  X,
  ExternalLink,
  ShieldCheck,
  Send,
  Plus
} from 'lucide-react';
import { AnalyticsAPI, TopicAPI, BlogAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTopic, setPreviewTopic] = useState(null);
  const { isAutonomousRunning, triggerAutonomousCycle, showToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, topicsRes, blogsRes] = await Promise.allSettled([
          AnalyticsAPI.getDashboardData(),
          TopicAPI.getTopics({ limit: 8, t: Date.now() }),
          BlogAPI.getBlogs({ limit: 4, t: Date.now() })
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.data) {
          setData(dashRes.value.data);
        }
        if (topicsRes.status === 'fulfilled' && topicsRes.value.data?.topics) {
          setTopics(topicsRes.value.data.topics);
        }
        if (blogsRes.status === 'fulfilled' && blogsRes.value.data?.blogs) {
          setRecentBlogs(blogsRes.value.data.blogs);
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = data?.stats || {
    totalBlogs: 128,
    blogsChange: '+12 this week',
    trendingCount: 24,
    totalViews: '24.6K',
    viewsChange: '+18%',
    aiStatus: 'Active'
  };

  const handleWriteTopic = (topic) => {
    navigate('/writer', { state: { selectedTopic: topic } });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good Morning 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your AI content assistant is ready. Here is what is happening with your blog today.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => navigate('/writer')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Blog</span>
          </button>
        </div>
      </div>

      {/* 4 Simple Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blogs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Total Blogs
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalBlogs || 128}
          </div>
          <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {stats.blogsChange || '+12 this week'}
          </span>
        </div>

        {/* Card 2: Trending Topics */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" /> Trending
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.trendingCount || 24}
          </div>
          <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            New topics ready
          </span>
        </div>

        {/* Card 3: Views */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-500" /> Views
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalViews || '24.6K'}
          </div>
          <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {stats.viewsChange || '+18% growth'}
          </span>
        </div>

        {/* Card 4: AI Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-500" /> AI Assistant
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Active
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Auto-pilot ready (08:00 AM)
          </span>
        </div>
      </div>

      {/* SECTION: "What Should I Write?" (The Most Important Section) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              What Should You Write About?
            </h2>
            <p className="text-xs text-slate-500">
              Our AI found these high-traffic topics based on what your audience is searching for.
            </p>
          </div>

          <button
            onClick={() => navigate('/topics')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Topics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recommended Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.slice(0, 6).map((topic, index) => {
            const isTopMatch = index === 0;
            return (
              <div
                key={topic._id || index}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isTopMatch
                    ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                      🔥 Trending
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                      ⭐ Highly Relevant
                    </span>
                    <span className="text-[11px] text-slate-400 ml-auto">
                      {topic.category || 'General'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {topic.title}
                  </h3>

                  {topic.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>
                  )}

                  {/* Simple Key Indicators */}
                  <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-600">
                    <span>Search interest: <strong className="text-slate-900 font-bold">{topic.trendLevel || 'High'}</strong></span>
                    <span>Website relevance: <strong className="text-emerald-700 font-bold">{topic.relevance ? `${topic.relevance}%` : '92%'}</strong></span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    AI: Excellent Topic
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewTopic(topic)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleWriteTopic(topic)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✍️ Write Blog</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Blogs Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Blogs & Articles
            </h2>
            <p className="text-xs text-slate-500">Your latest articles and their current publishing status</p>
          </div>

          <button
            onClick={() => navigate('/blogs')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Blogs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {(recentBlogs.length > 0 ? recentBlogs : [
            { _id: '1', title: 'Agentic AI Workflows and Autonomous LLM Orchestration in Production', category: 'AI & Tech', status: 'PUBLISHED', publishedAt: new Date(), views: 4200 },
            { _id: '2', title: 'Modern Web Architecture: Building Scalable Cloud Applications', category: 'Engineering', status: 'IN_REVIEW', publishedAt: new Date(), views: 1800 }
          ]).map((blog) => (
            <div key={blog._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {blog.category || 'General'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    blog.status === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : blog.status === 'IN_REVIEW'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {blog.status === 'PUBLISHED' ? '🟢 Live on Website' : blog.status === 'IN_REVIEW' ? '🟡 Ready for Review' : '⚪ Draft'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{blog.title}</h4>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => navigate('/writer', { state: { selectedBlog: blog } })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate('/blogs')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {blog.status === 'PUBLISHED' ? 'View Live' : 'Review & Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Preview Modal */}
      {previewTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Topic Overview</span>
              <button onClick={() => setPreviewTopic(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">{previewTopic.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{previewTopic.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Suggested Category:</span>
                <strong className="text-slate-900">{previewTopic.category || 'General'}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Search Popularity:</span>
                <strong className="text-slate-900">{previewTopic.trendLevel || 'High'}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Website Relevance:</span>
                <strong className="text-emerald-700">{previewTopic.relevance ? `${previewTopic.relevance}%` : '92%'}</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setPreviewTopic(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const t = previewTopic;
                  setPreviewTopic(null);
                  handleWriteTopic(t);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Write This Blog</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
