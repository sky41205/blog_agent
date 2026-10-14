import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsAPI, MLAPI, BlogAPI } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [mlModels, setMlModels] = useState(null);
  const [isAutonomousRunning, setIsAutonomousRunning] = useState(false);
  const [lastCycleResult, setLastCycleResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [settingsRes, mlRes] = await Promise.allSettled([
        SettingsAPI.getSettings(),
        MLAPI.getModelsMetadata()
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.settings) {
        setSettings(settingsRes.value.data.settings);
      }
      if (mlRes.status === 'fulfilled' && mlRes.value.data?.metadata) {
        setMlModels(mlRes.value.data.metadata);
      }
    } catch (err) {
      console.warn('Initial data load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAutonomousCycle = async () => {
    setIsAutonomousRunning(true);
    showToast('Autonomous daily cycle triggered! Executing 14-step content intelligence pipeline...', 'info');
    try {
      const res = await BlogAPI.runAutonomousCycle();
      setLastCycleResult(res.data.cycleResult);
      showToast(`Autonomous Cycle completed! Blog "${res.data.cycleResult?.blogTitle || 'New Post'}" generated.`, 'success');
      return res.data;
    } catch (err) {
      showToast(`Autonomous cycle error: ${err.message}`, 'error');
    } finally {
      setIsAutonomousRunning(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <AppContext.Provider value={{
      settings,
      setSettings,
      mlModels,
      setMlModels,
      isAutonomousRunning,
      triggerAutonomousCycle,
      lastCycleResult,
      toast,
      showToast,
      addToast: showToast,
      loading,
      refreshData: async () => {
        await loadInitialData();
        showToast('Platform data refreshed successfully!', 'success');
      }
    }}>
      {children}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl transition-all transform translate-y-0 text-sm font-medium border backdrop-blur-md ${
          toast.type === 'error' ? 'bg-red-950/95 text-red-200 border-red-800' :
          toast.type === 'info' ? 'bg-sky-950/95 text-sky-200 border-sky-800' :
          'bg-emerald-950/95 text-emerald-200 border-emerald-800'
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 ml-2 font-bold cursor-pointer">&times;</button>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
