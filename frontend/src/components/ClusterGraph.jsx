import React from 'react';
import { Layers, Tag, ArrowRight } from 'lucide-react';

export default function ClusterGraph({ clusters = [] }) {
  if (!clusters || clusters.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900/50 border border-slate-800">
        No topic clusters formed yet. Discover trending topics to trigger NLP clustering.
      </div>
    );
  }

  const clusterColors = [
    'from-sky-500/20 to-blue-600/5 border-sky-500/30 text-sky-400',
    'from-purple-500/20 to-indigo-600/5 border-purple-500/30 text-purple-400',
    'from-emerald-500/20 to-teal-600/5 border-emerald-500/30 text-emerald-400',
    'from-amber-500/20 to-orange-600/5 border-amber-500/30 text-amber-400'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clusters.map((cluster, idx) => {
        const colorStyle = clusterColors[idx % clusterColors.length];
        return (
          <div
            key={cluster.cluster_id || idx}
            className={`p-5 rounded-2xl bg-gradient-to-b ${colorStyle} bg-slate-900/70 border backdrop-blur-sm space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Cluster {idx + 1}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                {cluster.topics_count || (cluster.topic_titles?.length || 0)} Topics
              </span>
            </div>

            <h4 className="text-base font-bold text-white tracking-tight">
              {cluster.name || 'AI & Engineering'}
            </h4>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(cluster.keywords || []).map((kw, kIdx) => (
                <span
                  key={kIdx}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950/60 text-slate-300 border border-slate-800/80"
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" /> {kw}
                </span>
              ))}
            </div>

            {/* Sample Topic Titles */}
            {cluster.topic_titles && cluster.topic_titles.length > 0 && (
              <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Topics in Cluster:</span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {cluster.topic_titles.slice(0, 3).map((t, tIdx) => (
                    <li key={tIdx} className="truncate hover:text-white flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
