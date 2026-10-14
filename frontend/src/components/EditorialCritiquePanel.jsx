import React from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function EditorialCritiquePanel({
  editorialData = null,
  revisionsApplied = [],
  criticRevisionHistory = [],
  onApplyManualRevision
}) {
  if (!editorialData) return null;

  const {
    verdict = 'APPROVED',
    editorialScore = 91,
    summaryAssessment = '',
    strengths = [],
    findings = [],
    mandatoryRevisions = [],
    writingIssues = [],
    visualIssues = [],
    criticRevisionHistory: modelHistory = []
  } = editorialData;

  const history = (criticRevisionHistory && criticRevisionHistory.length > 0)
    ? criticRevisionHistory
    : (modelHistory || []);

  const isApproved = verdict === 'APPROVED';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Editorial Review & Critic–Revision Loop
              </h3>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Verdict: {verdict}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Closed feedback loop between Reviewer and Writer/Image Agents (Cost Guard Enforced)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xl font-black text-slate-900">
              {editorialScore}<span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Editorial Score
            </span>
          </div>
        </div>
      </div>

      {/* Critic-Revision Loop Iterations Banner */}
      {history && history.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Critic–Revision Multi-Turn Iteration Log:</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
              Cost Control: Max 2 Retries Enforced
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            {history.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-indigo-100 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-900">Round {h.round || idx + 1}:</span>
                  <span className="text-slate-700">{h.action || `${h.issuesFound || 0} issue(s) detected`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    h.verdict === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {h.verdict || 'REVISION_NEEDED'}
                  </span>
                  <span className="font-mono text-slate-500 font-semibold">{h.editorialScore || editorialScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Assessment */}
      {summaryAssessment && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
          {summaryAssessment}
        </div>
      )}

      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Key Editorial Strengths:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {strengths.map((str, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-medium text-emerald-950 flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{typeof str === 'object' ? (str.point || str.strength || str.text || JSON.stringify(str)) : String(str)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Findings */}
      {findings && findings.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Itemized Review Findings & Corrections:</span>
          </span>
          <div className="space-y-2.5">
            {findings.map((f, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700">
                    {typeof f.category === 'object' ? JSON.stringify(f.category) : (f.category || 'General')}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    f.severity === 'Critical' ? 'bg-rose-100 text-rose-700' :
                    f.severity === 'Warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {f.severity || 'Notice'}
                  </span>
                </div>

                {f.quotedIssue && (
                  <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                    "{typeof f.quotedIssue === 'object' ? JSON.stringify(f.quotedIssue) : f.quotedIssue}"
                  </p>
                )}

                <div className="text-slate-800 font-medium text-xs flex items-start gap-1.5 pt-1">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-indigo-900">Suggested Correction:</strong>{' '}
                    {typeof f.suggestedCorrection === 'object'
                      ? (f.suggestedCorrection.text || f.suggestedCorrection.correction || JSON.stringify(f.suggestedCorrection))
                      : String(f.suggestedCorrection || '')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revisions Applied Changelog */}
      {revisionsApplied && revisionsApplied.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs">
          <span className="font-bold text-indigo-950 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Final Revision Agent (Agent 9) Applied Changelog:</span>
          </span>
          <ul className="list-disc list-inside space-y-1 text-indigo-900 font-medium pl-1">
            {revisionsApplied.map((rev, i) => (
              <li key={i}>
                {typeof rev === 'object' ? (rev.description || rev.text || rev.change || JSON.stringify(rev)) : String(rev)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
