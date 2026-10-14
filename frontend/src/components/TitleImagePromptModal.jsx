import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Palette,
  Copy,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  Camera,
  Layers,
  Wand2,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { BlogAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { getTopicFallbackImage } from '../pages/AIWriter';

export default function TitleImagePromptModal({
  isOpen,
  onClose,
  blogTitle,
  blogCategory,
  onApplyImage
}) {
  if (!isOpen) return null;

  const { showToast } = useApp();
  const [titleInput, setTitleInput] = useState(blogTitle || '');
  const [categoryInput, setCategoryInput] = useState(blogCategory || 'AI & Automation');
  const [isLoading, setIsLoading] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedFormatTab, setSelectedFormatTab] = useState('flux'); // 'flux' | 'midjourney' | 'dalle3' | 'imagen3'

  const fetchPrompt = async (targetTitle = titleInput, targetCategory = categoryInput) => {
    if (!targetTitle?.trim()) {
      showToast('Please provide a blog title first', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const res = await BlogAPI.generateTitleImagePrompt({
        title: targetTitle,
        category: targetCategory,
        preferredStyle: 'documentary_35mm'
      });
      const payload = res.data?.data || res.data;
      if (payload && (payload.success || payload.masterPrompt)) {
        setAgentData(payload);
      } else {
        showToast('Unable to generate image prompts', 'error');
      }
    } catch (err) {
      console.error('Failed to run Title Image Prompt Agent:', err);
      showToast(err.response?.data?.message || err.message || 'Error generating prompts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTitleInput(blogTitle || '');
      setCategoryInput(blogCategory || 'AI & Automation');
      fetchPrompt(blogTitle, blogCategory);
    }
  }, [isOpen, blogTitle]);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApply = (imageUrl, promptText) => {
    if (onApplyImage) {
      onApplyImage(imageUrl, promptText);
      showToast('Applied as featured cover image!', 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Camera className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  Title Image Prompt Agent
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Agent #13
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-300">
                Transforms blog titles into high-fidelity physical prompts & optics for Flux, Midjourney, DALL-E & Imagen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title Input & Domain Inspector Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Enter or refine blog title..."
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-2xs"
            />
          </div>
          <button
            onClick={() => fetchPrompt(titleInput, categoryInput)}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing Prompts...' : 'Regenerate Prompts'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {isLoading && !agentData && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-600">
                Analyzing title semantics, physical subjects, and optical camera parameters...
              </p>
            </div>
          )}

          {agentData && (
            <>
              {/* Semantic Analysis Badge Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                      Detected Domain & Context
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {agentData.titleAnalysis?.domain?.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {agentData.titleAnalysis?.rationale}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Target Visual Subject & Setting
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 line-clamp-2">
                      {agentData.titleAnalysis?.visualSubject}
                    </p>
                  </div>
                </div>
              </div>

              {/* Master Optical Prompt */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 shadow-md space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Master Optical Prompt (No Clichés / Realistic Composition)
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(agentData.masterPrompt, 'master')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700"
                  >
                    {copiedKey === 'master' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Master</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 select-all">
                  {agentData.masterPrompt}
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span><strong>Negative:</strong> {agentData.negativePrompt?.slice(0, 75)}...</span>
                  <button
                    onClick={() => copyToClipboard(agentData.negativePrompt, 'negative')}
                    className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                  >
                    {copiedKey === 'negative' ? 'Copied Negative!' : 'Copy Negative Prompt'}
                  </button>
                </div>
              </div>

              {/* Formatted Generator Exports (Tabs) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-indigo-600" />
                    <span>Formatted Prompts by Image Generator</span>
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setSelectedFormatTab('flux')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedFormatTab === 'flux'
                          ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Flux / SDXL
                    </button>
                    <button
                      onClick={() => setSelectedFormatTab('midjourney')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedFormatTab === 'midjourney'
                          ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Midjourney v6.1
                    </button>
                    <button
                      onClick={() => setSelectedFormatTab('dalle3')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedFormatTab === 'dalle3'
                          ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      DALL-E 3
                    </button>
                    <button
                      onClick={() => setSelectedFormatTab('imagen3')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedFormatTab === 'imagen3'
                          ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Imagen 3
                    </button>
                  </div>
                </div>

                {/* Active Format Tab Content */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {selectedFormatTab === 'flux' && 'Flux 1.1 Pro / SDXL Lightning Format'}
                      {selectedFormatTab === 'midjourney' && 'Midjourney v6.1 CLI Arguments (--ar 16:9 --v 6.1 --style raw)'}
                      {selectedFormatTab === 'dalle3' && 'OpenAI DALL-E 3 Contextual Narrative Format'}
                      {selectedFormatTab === 'imagen3' && 'Google Cloud Imagen 3 Photoreal Format'}
                    </span>
                    <p className="text-xs text-slate-800 font-mono bg-white p-3 rounded-xl border border-slate-200 select-all leading-relaxed">
                      {selectedFormatTab === 'flux' && agentData.formats?.flux}
                      {selectedFormatTab === 'midjourney' && agentData.formats?.midjourney}
                      {selectedFormatTab === 'dalle3' && agentData.formats?.dalle3}
                      {selectedFormatTab === 'imagen3' && agentData.formats?.imagen3}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(agentData.formats?.[selectedFormatTab], selectedFormatTab)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-stretch sm:self-center"
                  >
                    {copiedKey === selectedFormatTab ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white" />
                        <span>Copy Format Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 5 Distinct Artistic Variations with Instant Previews */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>5 Visual Style Directions (Ready to Apply)</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Click "Apply as Cover" to update your blog instantly
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {agentData.styles?.map((styleObj) => (
                    <div
                      key={styleObj.styleId}
                      className="group flex flex-col rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={styleObj.previewUrl}
                          alt={styleObj.label}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getTopicFallbackImage(blogTitle, blogCategory);
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                            {styleObj.label}
                          </span>
                        </div>
                        <a
                          href={styleObj.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Info & Actions */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                        <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                          "{styleObj.prompt}"
                        </p>
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => copyToClipboard(styleObj.prompt, styleObj.styleId)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {copiedKey === styleObj.styleId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleApply(styleObj.previewUrl, styleObj.prompt)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Apply as Cover</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Agent outputs are tuned with real camera optics (35mm f/1.4, Hasselblad, ISO 100).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
