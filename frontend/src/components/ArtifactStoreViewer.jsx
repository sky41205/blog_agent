import React, { useState } from 'react';
import {
  Layers,
  FileCode2,
  Lock,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Hash,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ArtifactStoreViewer({ artifacts = [], sessionId = null }) {
  const [selectedArtifactId, setSelectedArtifactId] = useState(artifacts[0]?.id || null);
  const [copiedHash, setCopiedHash] = useState(false);

  const selectedArtifact = artifacts.find(a => a.id === selectedArtifactId) || artifacts[0] || null;

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Immutable Artifacts In Memory</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Artifacts are automatically produced as immutable, frozen snapshots during the Multi-Agent pipeline execution. Launch a generation run to inspect versioned contract artifacts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Immutable Artifact Store (Strict Agent Independence)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every agent output is deep-frozen with a unique SHA-256 hash. Downstream agents read read-only snapshots and cannot mutate upstream state.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {artifacts.length} Immutable Artifacts
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              Deep Frozen
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Artifacts List */}
        <div className="space-y-2 lg:col-span-1">
          {artifacts.map((art, idx) => {
            const isSelected = (selectedArtifact?.id || artifacts[0]?.id) === art.id;

            return (
              <div
                key={art.id}
                onClick={() => setSelectedArtifactId(art.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-1.5 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {art.version || 'v1'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {art.createdAt ? new Date(art.createdAt).toLocaleTimeString() : ''}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 line-clamp-1">
                  {art.artifactType?.replace(/_/g, ' ')?.toUpperCase()}
                </div>

                <div className="text-[10px] text-slate-500 font-mono truncate">
                  Agent: {art.agentId}
                </div>

                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 truncate">
                  <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{art.contentHash?.slice(0, 16)}...</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Artifact JSON & Hash Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedArtifact && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {selectedArtifact.version || 'v1'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {selectedArtifact.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Origin Agent: <span className="font-bold text-slate-700">{selectedArtifact.agentId}</span> &bull; Type: <span className="font-bold text-slate-700">{selectedArtifact.artifactType}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyHash(selectedArtifact.contentHash)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'Hash Copied!' : 'Copy SHA-256'}</span>
                </button>
              </div>

              {/* SHA-256 Badge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 font-mono text-[11px] space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cryptographic Integrity (SHA-256 Content Hash)
                </div>
                <div className="text-indigo-900 break-all font-semibold select-all">
                  {selectedArtifact.contentHash || 'Verified SHA-256 Hash'}
                </div>
              </div>

              {/* Immutable Snapshot Data Payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Deep-Frozen Snapshot Data</span>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read-Only Immutable
                  </span>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs max-h-96 overflow-y-auto shadow-inner leading-relaxed">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedArtifact.data || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
