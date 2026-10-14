import React from 'react';
import {
  Cloud,
  CreditCard,
  Search,
  ListTree,
  PenTool,
  TrendingUp,
  Image as ImageIcon,
  Wand2,
  Camera,
  CheckCircle2,
  FileCheck2,
  RefreshCw,
  Send,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const AGENT_DEFINITIONS = [
  { id: 1, key: 'api_integration', name: 'API & Cloud Integration', role: 'Agent 1', phase: 'Preflight', icon: Cloud, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 2, key: 'cloud_cost', name: 'Credits & Cost Manager', role: 'Agent 2', phase: 'Preflight', icon: CreditCard, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 3, key: 'research', name: 'Topic Research & Fact-Check', role: 'Agent 3', phase: 'Preparation', icon: Search, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 4, key: 'outline', name: 'Strategy & Outline', role: 'Agent 4', phase: 'Preparation', icon: ListTree, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 5, key: 'writing', name: 'Blog Writing Agent', role: 'Agent 5', phase: 'Preparation', icon: PenTool, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 6, key: 'seo', name: 'SEO Optimization', role: 'Agent 6', phase: 'Preparation', icon: TrendingUp, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { id: 7, key: 'image_strategy', name: 'Image Strategy', role: 'Agent 7', phase: 'Visuals', icon: ImageIcon, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 8, key: 'image_prompt', name: 'Prompt Engineering', role: 'Agent 8', phase: 'Visuals', icon: Wand2, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { id: 9, key: 'image_generation', name: 'Image Generation', role: 'Agent 9', phase: 'Visuals', icon: Camera, color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200' },
  { id: 10, key: 'image_validate', name: 'Image Validation', role: 'Agent 10', phase: 'Visuals', icon: CheckCircle2, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { id: 11, key: 'editorial_review', name: 'Editorial Critique', role: 'Agent 11', phase: 'QA', icon: FileCheck2, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 12, key: 'final_revision', name: 'Final Revision', role: 'Agent 12', phase: 'QA', icon: RefreshCw, color: 'text-lime-600 bg-lime-50 border-lime-200' },
  { id: 13, key: 'packaging', name: 'Publishing Packaging', role: 'Agent 13', phase: 'Finalization', icon: Send, color: 'text-violet-600 bg-violet-50 border-violet-200' }
];

export default function MultiAgentPipelineTracker({
  currentAgentIndex = 0,
  activeStep = '',
  logs = [],
  onSelectAgent,
  selectedAgentKey = null,
  isProcessing = false
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              13-Agent Autonomous Orchestration Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            5 Phases: Preflight (GCP ADC & Credits) &bull; Content Preparation &bull; Visuals &bull; QA Loop &bull; Finalization
          </p>
        </div>

        {isProcessing ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Agent Pipeline Active</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ready / Synchronized</span>
          </span>
        )}
      </div>

      {/* Agents Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {AGENT_DEFINITIONS.map((agent, idx) => {
          const Icon = agent.icon;
          const isDone = currentAgentIndex > agent.id || (!isProcessing && currentAgentIndex >= 13);
          const isCurrent = currentAgentIndex === agent.id && isProcessing;
          const isSelected = selectedAgentKey === agent.key;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent && onSelectAgent(agent.key)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer text-left relative group ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                  : isCurrent
                  ? 'border-amber-400 bg-amber-50/40 shadow-xs animate-pulse'
                  : isDone
                  ? 'border-slate-200 bg-white hover:border-slate-300'
                  : 'border-slate-100 bg-slate-50/60 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {agent.role}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : isCurrent ? (
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-300" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg border text-xs ${agent.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {agent.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Activity Log Stream */}
      {logs && logs.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Live Activity Stream</span>
            <span className="text-[10px] text-slate-400">{logs.length} logged step(s)</span>
          </div>
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-3.5 font-mono text-[11px] max-h-36 overflow-y-auto space-y-1.5 shadow-inner">
            {logs.slice(-6).map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-500 text-[10px] shrink-0">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'now'}
                </span>
                <span className="text-indigo-400 font-bold shrink-0">[{log.agent}]</span>
                <span className="text-slate-300 break-words">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
