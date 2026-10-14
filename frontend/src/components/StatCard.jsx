import React from 'react';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, color = 'sky', subtitle }) {
  const colorMap = {
    sky: {
      border: 'border-sky-500/20 hover:border-sky-500/40',
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      gradient: 'from-sky-500/5 via-transparent to-transparent'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      gradient: 'from-emerald-500/5 via-transparent to-transparent'
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      gradient: 'from-indigo-500/5 via-transparent to-transparent'
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      gradient: 'from-purple-500/5 via-transparent to-transparent'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      gradient: 'from-amber-500/5 via-transparent to-transparent'
    }
  };

  const scheme = colorMap[color] || colorMap.sky;

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-b ${scheme.gradient} bg-slate-900/70 border ${scheme.border} backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 shadow-lg group relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${scheme.iconBg} transition-transform group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-white tracking-tight font-mono">{value}</h3>
        {change && (
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
            changeType === 'positive'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-[11px] text-slate-400 font-medium truncate">{subtitle}</p>
      )}
    </div>
  );
}
