import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Search,
  BookOpen,
  TrendingUp,
  Image as ImageIcon,
  Eye,
  Sliders
} from 'lucide-react';

const RUBRIC_CONFIG = {
  factualReliability: { label: 'Factual Reliability', icon: Search, color: 'text-blue-600 bg-blue-50' },
  writingQuality: { label: 'Writing Quality', icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
  researchCitations: { label: 'Research & Citations', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
  seo: { label: 'SEO Optimization', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
  imageRelevance: { label: 'Image Relevance', icon: ImageIcon, color: 'text-purple-600 bg-purple-50' },
  imageVisualQuality: { label: 'Visual Fidelity', icon: Eye, color: 'text-pink-600 bg-pink-50' },
  accessibility: { label: 'Accessibility & Alt Text', icon: CheckCircle2, color: 'text-cyan-600 bg-cyan-50' },
  overallReadiness: { label: 'Overall Readiness', icon: ShieldCheck, color: 'text-violet-600 bg-violet-50' }
};

export default function QualityGateCard({ qualityGateData }) {
  if (!qualityGateData) return null;

  const {
    passed = true,
    overallReadiness = 90,
    decision = 'APPROVED_AUTO',
    criticalFailures = [],
    warnings = [],
    requiresHumanReview = false,
    rubricScores = {}
  } = qualityGateData;

  const isApproved = decision.includes('APPROVED');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {isApproved ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Intelligent Quality Gate
              </h3>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {decision}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-dimensional rubric audit with explicit verification criteria
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">
            {overallReadiness}<span className="text-sm font-semibold text-slate-400">/100</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Overall Readiness Score
          </span>
        </div>
      </div>

      {/* Critical Failure Alerts (Numerical Score Cannot Override Rule) */}
      {criticalFailures && criticalFailures.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
            <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Critical Failure Detected (Numerical Score Cannot Override):</span>
          </div>
          <ul className="list-disc list-inside text-xs text-rose-700 space-y-1 font-medium pl-1">
            {criticalFailures.map((cf, idx) => (
              <li key={idx}>
                {typeof cf === 'object' ? (cf.failure || cf.reason || cf.message || JSON.stringify(cf)) : String(cf)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Human Review Banner */}
      {requiresHumanReview && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">Human Review Required: </span>
            Automated confidence bounds recommend manual editorial sign-off prior to public distribution.
          </div>
        </div>
      )}

      {/* 8-Dimension Rubric Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {Object.entries(rubricScores).map(([key, data]) => {
          const cfg = RUBRIC_CONFIG[key] || { label: key, icon: Sliders, color: 'text-slate-600 bg-slate-50' };
          const Icon = cfg.icon;
          const score = data.score ?? 85;
          const isPassed = data.passed ?? (score >= 80);

          return (
            <div
              key={key}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${cfg.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-slate-800">{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${isPassed ? 'text-slate-900' : 'text-rose-600'}`}>
                    {score}/100
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              </div>

              {/* Score Bar */}
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>

              {/* Rubric Reason & Evidence */}
              <div className="text-[11px] space-y-0.5 text-slate-600 leading-tight">
                <p className="font-medium text-slate-700">
                  {typeof data.reason === 'object' ? (data.reason.text || data.reason.message || JSON.stringify(data.reason)) : String(data.reason || '')}
                </p>
                {data.evidence && (
                  <p className="text-[10px] text-slate-400 font-mono italic">
                    Evidence: {typeof data.evidence === 'object' ? JSON.stringify(data.evidence) : String(data.evidence)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
