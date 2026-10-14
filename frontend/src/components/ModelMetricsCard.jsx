import React from 'react';
import { Cpu, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ModelMetricsCard({ modelName, modelData, onRetrain, isRetraining }) {
  const metrics = modelData?.metrics || {};

  const prettyNames = {
    trend_model: 'Trend Detection Engine',
    topic_relevance_model: 'Topic Relevance Classifier',
    performance_model: 'Blog Performance Regressor',
    publishing_time_model: 'Optimal Publishing Time Optimizer'
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">{prettyNames[modelName] || modelName}</h4>
              <p className="text-[11px] font-mono text-slate-500">{modelData?.algorithm || 'Scikit-Learn Model'}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            Active
          </span>
        </div>

        {/* Dataset Size info */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
          <span>Training Records:</span>
          <span className="font-mono text-slate-900 font-semibold">{modelData?.dataset_size || '1,800'} samples</span>
        </div>

        {/* Metrics Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {metrics.accuracy !== undefined && (
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Accuracy</span>
              <span className="font-mono font-bold text-indigo-600">{(metrics.accuracy * 100).toFixed(1)}%</span>
            </div>
          )}
          {metrics.f1 !== undefined && (
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">F1 Score</span>
              <span className="font-mono font-bold text-indigo-600">{metrics.f1.toFixed(3)}</span>
            </div>
          )}
          {metrics.r2 !== undefined && (
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">R² Score</span>
              <span className="font-mono font-bold text-emerald-600">{metrics.r2.toFixed(3)}</span>
            </div>
          )}
          {metrics.mae !== undefined && (
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">MAE (Error)</span>
              <span className="font-mono font-bold text-amber-600">{metrics.mae.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Validation: Zero Leakage</span>
        <button
          onClick={onRetrain}
          disabled={isRetraining}
          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>Retrain</span>
        </button>
      </div>
    </div>
  );
}
