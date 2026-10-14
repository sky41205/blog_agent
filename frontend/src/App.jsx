import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import TopicIntelligence from './pages/TopicIntelligence';
import AIWriter from './pages/AIWriter';
import BlogManager from './pages/BlogManager';
import AnalyticsPage from './pages/AnalyticsPage';
import AIMLPage from './pages/AIMLPage';
import ContentCalendar from './pages/ContentCalendar';
import LiveWebsitePreview from './pages/LiveWebsitePreview';
import MySQLManager from './pages/MySQLManager';
import Settings from './pages/Settings';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ErrorBoundary from './components/ErrorBoundary';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 selection:text-indigo-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/topics" element={<TopicIntelligence />} />
            <Route path="/writer" element={<AIWriter />} />
            <Route path="/create" element={<AIWriter />} />
            <Route path="/blogs" element={<BlogManager />} />
            <Route path="/calendar" element={<ContentCalendar />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ai-ml" element={<AIMLPage />} />
            <Route path="/ml-hub" element={<AIMLPage />} />
            <Route path="/live-preview" element={<LiveWebsitePreview />} />
            <Route path="/mysql" element={<MySQLManager />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/monetize" element={<SubscriptionsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
