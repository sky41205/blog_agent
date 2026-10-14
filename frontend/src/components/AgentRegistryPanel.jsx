import React, { useState } from 'react';
import {
  Bot,
  Shield,
  Layers,
  Clock,
  Key,
  Database,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AgentRegistryPanel({ agents = [] }) {
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [activePhaseFilter, setActivePhaseFilter] = useState('ALL');

  const phases = [
    'ALL',
    'Phase A: Preflight',
    'Phase B: Content Preparation',
    'Phase C: Visual Production',
    'Phase D: Quality Assurance',
    'Phase E: Finalization'
  ];

  const filteredAgents = activePhaseFilter === 'ALL'
    ? agents
    : agents.filter(a => a.phase?.includes(activePhaseFilter.replace('ALL', '')));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              13-Agent Architecture & Central Registry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly decoupled, single-responsibility agents communicating exclusively via versioned immutable artifacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {agents.length} Registered Agents
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Autonomous DAG
            </span>
          </div>
        </div>

        {/* Phase Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
          {phases.map(p => (
            <button
              key={p}
              onClick={() => setActivePhaseFilter(p)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                activePhaseFilter === p
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Agents List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgents.map((agent, idx) => {
          const isExpanded = selectedAgentId === agent.id;

          return (
            <div
              key={agent.id}
              className={`p-5 rounded-3xl bg-white border transition-all ${
                isExpanded
                  ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                  : 'border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700">
                      {agent.phase || 'Specialist'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      v{agent.version || '1.0'}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {agent.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500">
                    ID: {agent.id}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAgentId(isExpanded ? null : agent.id)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Responsibility Statement */}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {agent.responsibility}
              </p>

              {/* Quick Spec Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Timeout: {(agent.resourceLimits?.timeoutMs || 30000) / 1000}s
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-slate-400" />
                  Max Retries: {agent.resourceLimits?.maxRetries ?? 2}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {agent.healthStatus || 'HEALTHY'}
                </span>
              </div>

              {/* Expanded Specs Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Allowed Providers
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(agent.allowedProviders || []).map((prov, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-50/70 text-indigo-800 text-[10px] font-medium font-mono">
                          {prov}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Authorized Data Sources
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(agent.authorizedDataSources || []).map((src, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Permissions (Least Privilege)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(agent.permissions || []).map((perm, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-mono border border-amber-200/50">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
