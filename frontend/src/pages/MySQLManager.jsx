import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Server,
  Table,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Play,
  Eye,
  Search,
  Filter,
  Download,
  Key,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { MySQLAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function MySQLManager() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('blogs');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Data states
  const [blogs, setBlogs] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tablesSchema, setTablesSchema] = useState([]);
  const [selectedTable, setSelectedTable] = useState('blogs');
  const [tableData, setTableData] = useState({ rows: [], total: 0 });
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState('SELECT id, title, category, status, quality_score, seo_score, predicted_views FROM blogs ORDER BY id DESC LIMIT 20;');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState(null);

  // Connection config state
  const [configForm, setConfigForm] = useState({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'autonomous_blogger'
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');
  const [configError, setConfigError] = useState('');

  // Fetch initial status and data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const statusRes = await MySQLAPI.getStatus();
      if (statusRes.data?.data) {
        const s = statusRes.data.data;
        setStatus(s);
        if (s.config) {
          setConfigForm(prev => ({
            ...prev,
            host: s.config.host || 'localhost',
            port: String(s.config.port || '3306'),
            user: s.config.user || 'root',
            database: s.config.database || 'autonomous_blogger'
          }));
        }
      }

      // Fetch tables & schema
      const tablesRes = await MySQLAPI.getTables().catch(() => null);
      if (tablesRes?.data?.tables) {
        setTablesSchema(tablesRes.data.tables);
      }

      // Fetch MySQL blogs
      const blogsRes = await MySQLAPI.getBlogs({ limit: 100 }).catch(() => null);
      if (blogsRes?.data?.blogs) {
        setBlogs(blogsRes.data.blogs);
      }

      // Fetch MySQL topics
      const topicsRes = await MySQLAPI.getTopics({ limit: 100 }).catch(() => null);
      if (topicsRes?.data?.topics) {
        setTopics(topicsRes.data.topics);
      }
    } catch (err) {
      console.warn('Failed to load MySQL data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const res = await MySQLAPI.syncAll();
      showToast(`Synchronized ${res.data?.summary?.blogsSynced || 0} blogs and ${res.data?.summary?.topicsSynced || 0} topics to MySQL!`, 'success');
      await loadAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Sync failed. Check MySQL connection.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleRunQuery = async () => {
    setQueryLoading(true);
    setQueryError(null);
    try {
      const res = await MySQLAPI.runQuery(sqlQuery);
      setQueryResult(res.data);
      showToast(`Query executed in ${res.data?.executionTimeMs || 0} ms`, 'success');
    } catch (err) {
      setQueryError(err.response?.data?.error || err.message);
      setQueryResult(null);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e?.preventDefault();
    setTestingConnection(true);
    setConfigSuccess('');
    setConfigError('');
    try {
      const res = await MySQLAPI.saveConfig(configForm);
      if (res.data?.success) {
        setConfigSuccess('MySQL credentials saved and connected successfully!');
        showToast('MySQL Connected and Database Synchronized!', 'success');
        await loadAllData();
      } else {
        setConfigError(res.data?.message || 'Connection failed.');
      }
    } catch (err) {
      setConfigError(err.response?.data?.message || err.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLoadTableData = async (tableName) => {
    setSelectedTable(tableName);
    try {
      const res = await MySQLAPI.getTableData(tableName, { limit: 50 });
      if (res.data) {
        setTableData({ rows: res.data.rows || [], total: res.data.total || 0 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mysql_blogs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredBlogs = blogs.filter(b => {
    const matchSearch = searchTerm === '' || 
      (b.title && b.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.slug && b.slug.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchCategory = categoryFilter === 'All' || b.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const isConnected = status?.connected === true;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Connection Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">MySQL Relational Database Studio</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isConnected 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`}></span>
                  {isConnected ? 'LIVE CONNECTED' : 'REQUIRES PASSWORD'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isConnected 
                  ? `Connected to MySQL • Database: \`${status?.database}\` • Host: ${status?.host}:${status?.port}`
                  : 'Enter your MySQL password in Connection Settings below to activate relational tables.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing Tables...' : 'Sync MongoDB ➔ MySQL'}</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>Connection Settings</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500">MySQL Written Blogs</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{status?.tables?.blogs ?? blogs.length}</div>
            <span className="text-[10px] text-emerald-700 font-mono">table: `blogs`</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500">MySQL Discovered Topics</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{status?.tables?.topics ?? topics.length}</div>
            <span className="text-[10px] text-indigo-700 font-mono">table: `topics`</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500">Analytics Records</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{status?.tables?.blog_analytics ?? 0}</div>
            <span className="text-[10px] text-purple-700 font-mono">table: `blog_analytics`</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500">Database Engine</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">InnoDB</div>
            <span className="text-[10px] text-slate-500 font-mono">utf8mb4_unicode_ci</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'blogs', label: 'Written Blogs (MySQL)', icon: FileText, count: blogs.length },
          { id: 'topics', label: 'Discovered Topics (MySQL)', icon: TrendingUp, count: topics.length },
          { id: 'schema', label: 'Tables & Schema', icon: Table, count: tablesSchema.length },
          { id: 'console', label: 'SQL Query Console', icon: Terminal },
          { id: 'settings', label: 'Connection Settings', icon: Key }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'schema' && tablesSchema.length > 0) {
                  handleLoadTableData(selectedTable);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Written Blogs from MySQL */}
      {activeTab === 'blogs' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search MySQL blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Environment Protection">Environment Protection</option>
                <option value="Animal Welfare & Rescue">Animal Welfare & Rescue</option>
                <option value="Women Empowerment">Women Empowerment</option>
                <option value="Education Support">Education Support</option>
              </select>

              <button
                onClick={handleExportJSON}
                disabled={blogs.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                title="Export MySQL blogs as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Blogs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Title & Slug</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">SEO Score</th>
                    <th className="py-3.5 px-4">Quality</th>
                    <th className="py-3.5 px-4">Est. Views</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Published At</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        {loading ? 'Loading records from MySQL...' : 'No blog records found in MySQL table.'}
                      </td>
                    </tr>
                  ) : (
                    filteredBlogs.map((b) => (
                      <tr key={b.id || b._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">#{b.id || 1}</td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate">{b.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">/{b.slug}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {b.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                            {b.seo_score || b.seo?.seoScore || 85}/100
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[11px]">
                            {b.quality_score || b.qualityMetrics?.qualityScore || 85}/100
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 font-mono">
                          {(b.predicted_views || b.performancePrediction?.predictedViews || 3500).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'PUBLISHED' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : b.status === 'IN_REVIEW'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {b.published_at || b.publishedAt ? new Date(b.published_at || b.publishedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedBlog(b)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer"
                            title="Inspect Full MySQL Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Discovered Topics from MySQL */}
      {activeTab === 'topics' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Topic Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Trend Score</th>
                  <th className="py-3.5 px-4">Relevance</th>
                  <th className="py-3.5 px-4">Priority Score</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No topic records found in MySQL table.
                    </td>
                  </tr>
                ) : (
                  topics.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">#{t.id || 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-sm">{t.title}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-amber-600">{t.trend_score || t.trendScore || 75}/100</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono">
                        {((t.relevance_score || t.relevanceScore || 0.85) * 100).toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          {t.topic_priority_score || t.topicPriorityScore || 80}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Tables & Schema Inspector */}
      {activeTab === 'schema' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">MySQL Tables</h3>
            {['blogs', 'topics', 'blog_analytics', 'platform_settings'].map((tName) => {
              const info = tablesSchema.find(t => t.tableName === tName);
              const isSel = selectedTable === tName;
              return (
                <button
                  key={tName}
                  onClick={() => handleLoadTableData(tName)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSel
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Table className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-mono font-bold">{tName}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {info?.rowCount ?? 0} rows
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-mono font-bold text-slate-900">Table: `{selectedTable}`</span>
                <span className="text-[11px] text-slate-500">({tableData.rows.length} records shown)</span>
              </div>
              <button
                onClick={() => handleLoadTableData(selectedTable)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto max-h-[500px] shadow-xs">
              {tableData.rows.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No records found in table `{selectedTable}`</div>
              ) : (
                <table className="w-full text-left text-[11px] text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] sticky top-0 border-b border-slate-200">
                    <tr>
                      {Object.keys(tableData.rows[0] || {}).map((col) => (
                        <th key={col} className="py-2.5 px-3 font-mono">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {tableData.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {Object.values(row).map((val, idx) => (
                          <td key={idx} className="py-2 px-3 max-w-xs truncate text-slate-700">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SQL Query Console */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Execute SQL Query (Read-Only)</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Quick:</span>
                <button
                  onClick={() => setSqlQuery('SELECT id, title, category, status, quality_score, seo_score FROM blogs;')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-mono cursor-pointer"
                >
                  blogs
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT id, title, trend_score, topic_priority_score, status FROM topics;')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-mono cursor-pointer"
                >
                  topics
                </button>
                <button
                  onClick={() => setSqlQuery('SHOW TABLES;')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-mono cursor-pointer"
                >
                  SHOW TABLES
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              placeholder="SELECT * FROM blogs LIMIT 10;"
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500">Supported: SELECT, SHOW, DESCRIBE, EXPLAIN</span>
              <button
                onClick={handleRunQuery}
                disabled={queryLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{queryLoading ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {/* Query Error */}
          {queryError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{queryError}</span>
            </div>
          )}

          {/* Query Result Grid */}
          {queryResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Query Results ({queryResult.rowCount} rows)</span>
                <span className="text-slate-500 font-mono">{queryResult.executionTimeMs} ms</span>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-[11px] text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      {queryResult.columns?.map(col => (
                        <th key={col} className="py-2 px-3 font-mono">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {queryResult.rows?.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {Object.values(r).map((val, idx) => (
                          <td key={idx} className="py-2 px-3 max-w-xs truncate text-slate-700">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Connection Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            MySQL Database Connection Settings
          </h3>

          {configSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{configSuccess}</span>
            </div>
          )}

          {configError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{configError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">MySQL Host</label>
              <input
                type="text"
                value={configForm.host}
                onChange={(e) => setConfigForm({ ...configForm, host: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Port</label>
              <input
                type="text"
                value={configForm.port}
                onChange={(e) => setConfigForm({ ...configForm, port: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Username</label>
              <input
                type="text"
                value={configForm.user}
                onChange={(e) => setConfigForm({ ...configForm, user: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Password</label>
              <input
                type="password"
                value={configForm.password}
                placeholder="Enter MySQL password"
                onChange={(e) => setConfigForm({ ...configForm, password: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="text-slate-700 font-semibold block mb-1">Database Name</label>
              <input
                type="text"
                value={configForm.database}
                onChange={(e) => setConfigForm({ ...configForm, database: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={testingConnection}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{testingConnection ? 'Testing Connection...' : 'Save & Connect'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Selected Blog Record Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">MySQL Blog Record #{selectedBlog.id}</h3>
              </div>
              <button onClick={() => setSelectedBlog(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Title</span>
                <p className="font-bold text-slate-900 text-sm">{selectedBlog.title}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Slug</span>
                <p className="font-mono text-indigo-600">/{selectedBlog.slug}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">SEO Score</span>
                  <span className="font-bold text-emerald-600">{selectedBlog.seo_score || 85}/100</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Quality</span>
                  <span className="font-bold text-indigo-600">{selectedBlog.quality_score || 85}/100</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Est. Views</span>
                  <span className="font-bold text-slate-900">{(selectedBlog.predicted_views || 3500).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-600">{selectedBlog.status}</span>
                </div>
              </div>

              {selectedBlog.excerpt && (
                <div className="pt-2">
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Excerpt</span>
                  <p className="text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedBlog.excerpt}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
