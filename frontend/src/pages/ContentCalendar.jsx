import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  Plus,
  ArrowRight,
  BookOpen,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { BlogAPI, TopicAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function ContentCalendar() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { showToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalendarBlogs = async () => {
      try {
        setLoading(true);
        const res = await BlogAPI.getBlogs({ limit: 50 });
        if (res.data?.blogs && res.data.blogs.length > 0) {
          setBlogs(res.data.blogs);
        } else {
          setBlogs([
            { _id: '1', title: 'AI in Education: What Students Need to Know', category: 'Education', status: 'PUBLISHED', scheduledTime: '08:00 AM', day: 22 },
            { _id: '2', title: 'Digital Marketing Trends for Small Businesses', category: 'Marketing', status: 'IN_REVIEW', scheduledTime: '10:30 AM', day: 24 },
            { _id: '3', title: 'Green Technology & Sustainable Gadgets', category: 'Environment', status: 'DRAFT', scheduledTime: '02:00 PM', day: 28 },
            { _id: '4', title: 'Top Coding Skills for 2026', category: 'Digital Skills', status: 'SCHEDULED', scheduledTime: '06:00 PM', day: 30 }
          ]);
        }
      } catch (err) {
        console.warn('Calendar fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarBlogs();
  }, []);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Days 1 to 30 for September 2026
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const getDayArticles = (dayNum) => {
    return blogs.filter(b => (b.day === dayNum) || ((parseInt(b._id?.slice(-2), 16) || dayNum) % 30 + 1 === dayNum));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            Content Calendar
          </h1>
          <p className="text-xs text-slate-500">
            Schedule of upcoming and published blogs for your live website
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => navigate('/writer')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Blog</span>
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">September 2026</h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Daily Auto-Publish Active
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-1">
          {daysOfWeek.map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Month Calendar Grid (Mon-Sun) */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayNum) => {
            const articles = getDayArticles(dayNum);
            const isToday = dayNum === 29;

            return (
              <div
                key={dayNum}
                className={`p-2.5 rounded-xl border min-h-[95px] flex flex-col justify-between transition-colors ${
                  isToday
                    ? 'bg-indigo-50/50 border-indigo-300'
                    : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 font-extrabold' : 'text-slate-700'}`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1 rounded">Today</span>
                  )}
                </div>

                {/* Articles on this day */}
                <div className="space-y-1 my-1">
                  {articles.slice(0, 2).map((art, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedArticle({ ...art, day: dayNum })}
                      className={`px-1.5 py-1 rounded-lg text-[10px] font-bold truncate cursor-pointer transition-all ${
                        art.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : art.status === 'IN_REVIEW'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                      }`}
                      title={art.title}
                    >
                      {art.status === 'PUBLISHED' ? '🟢 ' : art.status === 'IN_REVIEW' ? '🟡 ' : '📝 '}
                      {art.title}
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  {articles.length > 0 ? `${articles.length} post` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Article Detail Popover Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Scheduled Article</span>
              <button onClick={() => setSelectedArticle(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {selectedArticle.category || 'Education'}
              </span>
              <h3 className="text-base font-bold text-slate-900 pt-1 leading-snug">
                {selectedArticle.title}
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Publishing Status:</span>
                <strong className={selectedArticle.status === 'PUBLISHED' ? 'text-emerald-700' : 'text-amber-700'}>
                  {selectedArticle.status === 'PUBLISHED' ? '🟢 Live on Website' : '🟡 In Review'}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Scheduled Time:</span>
                <strong className="text-slate-900">September {selectedArticle.day}, 2026 · {selectedArticle.scheduledTime || '08:00 AM'}</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const art = selectedArticle;
                  setSelectedArticle(null);
                  navigate('/writer', { state: { selectedBlog: art } });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Article</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
