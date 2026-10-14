import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  BookOpen,
  Eye,
  Award,
  ArrowUpRight,
  Sparkles,
  Layers,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { AnalyticsAPI, BlogAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d'); // '7d' | '30d' | 'all'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await AnalyticsAPI.getDashboardData();
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Analytics fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = data?.stats || {
    totalViews: 24680,
    avgDwellTime: '3m 42s',
    topBlogTitle: 'AI in Education: What Students Need to Know',
    bestCategory: 'Education'
  };

  const viewsData = data?.trafficTrend || [
    { day: 'Mon', views: 2400 },
    { day: 'Tue', views: 4800 },
    { day: 'Wed', views: 3900 },
    { day: 'Thu', views: 5100 },
    { day: 'Fri', views: 3200 },
    { day: 'Sat', views: 1800 },
    { day: 'Sun', views: 2100 }
  ];

  const categoryData = data?.categoryDistribution || [
    { name: 'Education', count: 6, color: '#4f46e5' },
    { name: 'AI & Tech', count: 5, color: '#0ea5e9' },
    { name: 'Digital Skills', count: 4, color: '#10b981' },
    { name: 'Career Growth', count: 3, color: '#f59e0b' }
  ];

  const topBlogs = data?.topPerforming || [
    { id: '1', title: 'AI in Education: What Students Need to Know', views: 8420, category: 'Education', readTime: '4 min' },
    { id: '2', title: 'Top Digital Skills to Learn in 2026', views: 6150, category: 'Digital Skills', readTime: '5 min' },
    { id: '3', title: 'How Generative AI is Changing Everyday Work', views: 5240, category: 'AI & Tech', readTime: '6 min' },
    { id: '4', title: 'Sustainable Tech: Green Innovations', views: 4870, category: 'Environment', readTime: '3 min' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Blog Performance & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Understand your blog traffic, reader engagement, and top-performing articles
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
          {['7d', '30d', 'all'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                timeframe === tf ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf === '7d' ? 'Last 7 Days' : tf === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.totalViews ? stats.totalViews.toLocaleString() : '24,680'}
          </div>
          <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            +18% from last week
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Avg Reading Time</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.avgDwellTime || '3m 42s'}
          </div>
          <span className="text-[11px] text-slate-500 block">
            High reader retention
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Top Performing Blog</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 line-clamp-1">
            "AI in Education"
          </div>
          <span className="text-[11px] text-slate-500 block">
            8,420 views (34% of traffic)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Best Category</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.bestCategory || 'Education'}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Most engaged readers
          </span>
        </div>
      </div>

      {/* 2 Clean Charts: Views Over Time & Blogs by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Views Over Time */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Views Over Time</h3>
            <p className="text-xs text-slate-500">Daily visitor views on your published blogs</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="views" name="Views" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Blogs by Category */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Blogs by Category</h3>
            <p className="text-xs text-slate-500">Distribution of topics across your blog</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Articles" radius={[6, 6, 0, 0]} fill="#4f46e5">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Blogs Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Performing Blogs</h3>
            <p className="text-xs text-slate-500">Articles with the highest reader engagement</p>
          </div>
          <button
            onClick={() => navigate('/blogs')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Blogs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Article Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Read Time</th>
                <th className="py-3 px-4 text-right">Total Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {topBlogs.map((b, i) => (
                <tr key={b.id || i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-400">#{i + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.title}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {b.category || 'General'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{b.readTime || '4 min'}</td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">{b.views?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
