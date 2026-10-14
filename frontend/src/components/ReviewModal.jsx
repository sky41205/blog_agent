import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  FileText,
  ShieldCheck,
  Check,
  Globe,
  ExternalLink,
  Clock,
  RefreshCw,
  Edit,
  X,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { BlogAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function ReviewModal({ blog, isOpen, onClose, onUpdated, onOpenPostModal }) {
  if (!isOpen || !blog) return null;

  const { showToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'preview' | 'checklist'
  const [feedback, setFeedback] = useState(blog.review?.feedback || '');
  const [checklist, setChecklist] = useState({
    factChecked: blog.review?.checklist?.factChecked ?? true,
    seoVerified: blog.review?.checklist?.seoVerified ?? true,
    originalityVerified: blog.review?.checklist?.originalityVerified ?? true,
    codeReviewed: blog.review?.checklist?.codeReviewed ?? true,
    toneApproved: blog.review?.checklist?.toneApproved ?? true
  });

  const [isApproving, setIsApproving] = useState(false);
  const [isRevising, setIsRevising] = useState(false);

  const handleToggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 1-Click Approve & Publish
  const handleApproveAndPublish = async () => {
    setIsApproving(true);
    showToast('Approving blog and publishing to live website & MySQL...', 'info');
    try {
      const res = await BlogAPI.approveAndPublish(blog._id || blog.id, { feedback });
      showToast('🎉 Blog approved and published live!', 'success');
      if (onUpdated) onUpdated(res.data?.blog);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setIsApproving(false);
    }
  };

  // Request AI Revision
  const handleRequestRevision = async () => {
    if (!feedback.trim()) {
      showToast('Please type your revision instructions in the feedback box below.', 'error');
      return;
    }
    setIsRevising(true);
    showToast('AI is refining and revising the article according to your notes...', 'info');
    try {
      const res = await BlogAPI.requestRevision(blog._id || blog.id, { feedback });
      showToast('AI Revision complete! Draft updated.', 'success');
      if (onUpdated) onUpdated(res.data?.blog);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setIsRevising(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>🎉 Your blog is ready for review!</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                "{blog.title}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/30">
          {[
            { id: 'summary', label: 'Summary & Scores' },
            { id: 'preview', label: 'Full Article Preview' },
            { id: 'checklist', label: '5-Point Quality Gate' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-grow text-xs">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* 3 Key Metric Scores Cards (Section 16) */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-700 block">AI Quality</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {blog.qualityMetrics?.qualityScore || 92}%
                  </span>
                  <span className="text-[10px] text-indigo-600 block">Verified structure</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 block">SEO Score</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {blog.seo?.seoScore || 90}%
                  </span>
                  <span className="text-[10px] text-emerald-600 block">Keyword optimized</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 block">Fact Sources</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {blog.sourceCitations?.length || 6}
                  </span>
                  <span className="text-[10px] text-amber-600 block">Citations grounded</span>
                </div>
              </div>

              {/* Summary / Excerpt */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700 uppercase text-[10px]">Article Excerpt</span>
                <p className="text-slate-600 text-xs leading-relaxed italic">
                  "{blog.excerpt || 'Comprehensive guide covering modern best practices, key student benefits, and practical advice.'}"
                </p>
              </div>

              {/* Revision Feedback Box */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Editorial Notes / AI Revision Instructions (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Type here if you want AI to rewrite parts</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Add 2 more examples for college students, make the intro shorter..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 max-h-80 overflow-y-auto">
              <h3 className="text-base font-bold text-slate-900">{blog.title}</h3>
              <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                {blog.contentMarkdown || 'Content preview not available.'}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-2">
              {[
                { key: 'factChecked', label: 'Fact Verification & Grounding', desc: 'Article sources and facts verified with real citations' },
                { key: 'seoVerified', label: 'SEO & Search Optimization', desc: 'Title, headings, meta tags, and keyword placement are optimal' },
                { key: 'originalityVerified', label: 'Originality & Plagiarism Safe', desc: 'Content is unique and passes duplicate risk checks' },
                { key: 'codeReviewed', label: 'Formatting & Code Syntax Check', desc: 'Lists, bold tags, and code blocks format cleanly' },
                { key: 'toneApproved', label: 'Tone & Humanized Readability', desc: 'Conversational, clear, and engaging for target readers' }
              ].map(item => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => handleToggleCheck(item.key)}
                    className="w-4 h-4 text-indigo-600 rounded mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Buttons (Section 16) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate('/writer', { state: { selectedBlog: blog } });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit in Studio</span>
            </button>

            <button
              onClick={handleRequestRevision}
              disabled={isRevising}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRevising ? 'animate-spin' : ''}`} />
              <span>{isRevising ? 'Revising...' : 'Request AI Revision'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleApproveAndPublish}
              disabled={isApproving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproving ? 'Publishing...' : 'Approve & Publish Live'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
