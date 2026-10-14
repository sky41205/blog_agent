import React, { useState } from 'react';
import {
  Menu,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Server,
  Bot,
  Database,
  Globe,
  Radio,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ onToggleSidebar }) {
  const { refreshData } = useApp();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const services = [
    { name: 'AI Writing Service (Gemini)', status: 'Connected', desc: 'Researches and drafts full blog posts', icon: Bot, isOnline: true },
    { name: 'News & Search Service', status: 'Connected', desc: 'Discovers real-time search trends', icon: Radio, isOnline: true },
    { name: 'Database (MongoDB & MySQL)', status: 'Connected', desc: 'Stores drafts, published blogs, and metrics', icon: Database, isOnline: true },
    { name: 'Machine Learning Service', status: 'Connected', desc: 'Scores topic relevance and predicts traffic', icon: Sparkles, isOnline: true },
    { name: 'Live Website API', status: 'Connected', desc: 'Dispatches posts to client website endpoints', icon: Globe, isOnline: true }
  ];

  const notifications = [
    { id: 1, title: 'AI finished drafting new post', time: '10 mins ago', unread: true },
    { id: 2, title: '5 new trending topics discovered', time: '1 hour ago', unread: true },
    { id: 3, title: 'Daily website sync completed successfully', time: 'Today, 08:00 AM', unread: false }
  ];

  return (
    <header className="h-16 px-4 sm:px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left side: Hamburger (mobile) + Page / App Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm sm:text-base text-slate-800 tracking-tight">
          AI Blog Manager
        </span>
      </div>

      {/* Right side: AI Status Indicator + Notifications + Admin Profile */}
      <div className="flex items-center gap-3">
        {/* AI Status Indicator Button */}
        <button
          onClick={() => setShowStatusModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-semibold transition-colors cursor-pointer"
          title="Click to view AI system status"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden sm:inline">AI System Online</span>
          <span className="sm:hidden">Online</span>
        </button>

        {/* Global Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Refresh All Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">2 New</span>
              </div>
              <div className="divide-y divide-slate-100 py-1">
                {notifications.map((n) => (
                  <div key={n.id} className={`py-2 px-1 space-y-0.5 ${n.unread ? 'bg-indigo-50/40 rounded-lg px-2' : ''}`}>
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            AD
          </div>
          <span className="text-xs font-bold text-slate-700 hidden md:inline">Admin</span>
        </div>
      </div>

      {/* AI System Health Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI System Status</h3>
                  <p className="text-[11px] text-slate-500">All autonomous services running normally</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {services.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-slate-600 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{s.name}</span>
                        <span className="text-[11px] text-slate-500">{s.desc}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
