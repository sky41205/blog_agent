import React from 'react';
import { Flame, Target, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopicCard({ topic, onGenerate }) {
  const navigate = useNavigate();

  const getPriorityBadge = (score) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 70) return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const priority = topic.topicPriorityScore || 80;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-brand-500/5 group">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 uppercase tracking-wide">
            {topic.category || 'Tech & AI'}
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(priority)}`}>
            Rank: {priority}/100
          </span>
        </div>

        <h3 className="mt-3 text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
          {topic.title}
        </h3>

        {topic.description && (
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {topic.description}
          </p>
        )}

        {/* Scoring Breakdown Grid */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Trend
            </span>
            <span className="font-mono font-bold text-amber-400">{topic.trendScore || 75}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center justify-center gap-1">
              <Target className="w-3 h-3 text-sky-400" /> Rel
            </span>
            <span className="font-mono font-bold text-sky-400">{Math.round((topic.relevanceScore || 0.85) * 100)}%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> SEO
            </span>
            <span className="font-mono font-bold text-emerald-400">{topic.seoOpportunity || 82}</span>
          </div>
        </div>

        {topic.reasoning && (
          <p className="mt-2.5 text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 line-clamp-2">
            💡 {topic.reasoning}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500">
          Vol: {topic.searchVolume ? topic.searchVolume.toLocaleString() : '8,500'}/mo
        </span>
        <button
          onClick={() => onGenerate ? onGenerate(topic) : navigate('/writer', { state: { selectedTopic: topic } })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white text-xs font-bold border border-brand-500/30 transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Write Studio</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
