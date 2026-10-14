import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

export default function SEOMeter({ seoScore = 85, breakdown = {}, issues = [] }) {
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getProgressColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const metrics = [
    { label: 'Keyword Coverage', value: breakdown.keywordCoverage || 90 },
    { label: 'Title Optimization', value: breakdown.titleOptimization || 92 },
    { label: 'Meta Description Quality', value: breakdown.metaDescriptionQuality || 85 },
    { label: 'Heading Structure', value: breakdown.headingStructure || 90 },
    { label: 'Readability Score', value: breakdown.readability || 88 }
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">SEO Intelligence Audit</h4>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getScoreColor(seoScore)}`}>
          SEO Score: {seoScore}/100
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>{m.label}</span>
              <span>{m.value}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(m.value)}`}
                style={{ width: `${m.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Issues / Diagnostic checklist */}
      {issues && issues.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Optimization Checklist:
          </span>
          <ul className="space-y-1 text-[11px] text-slate-400">
            {issues.map((iss, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-500">•</span>
                <span>{iss}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
