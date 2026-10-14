import React, { useState, useEffect } from 'react';
import {
  Mic,
  Sparkles,
  Save,
  RefreshCw,
  CheckCircle2,
  Sliders,
  FileText,
  ShieldCheck,
  Ban,
  Wand2,
  Building2,
  HeartHandshake
} from 'lucide-react';
import { SettingsAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function BrandVoice() {
  const [brandVoice, setBrandVoice] = useState({
    tone: 'humanized, authentic, conversational and authoritative',
    formality: 'medium',
    paragraphLength: 'short (2-4 sentences)',
    style: 'engaging storytelling + hands-on engineering + actionable takeaways',
    ctaStyle: 'inspiring and value-driven',
    targetAudience: 'Engineers, Decision Makers, Donors, and Community Leaders'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [activePersona, setActivePersona] = useState('itlc_india');
  const { showToast } = useApp();

  useEffect(() => {
    const fetchVoice = async () => {
      try {
        setLoading(true);
        const res = await SettingsAPI.getSettings();
        if (res.data?.settings?.brandVoice) {
          setBrandVoice(res.data.settings.brandVoice);
        }
      } catch (err) {
        console.warn('Brand voice fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVoice();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await SettingsAPI.updateSettings({ brandVoice });
      showToast('🎉 Brand Voice & Humanization Profile updated successfully!', 'success');
    } catch (err) {
      showToast(`Save error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPersonaPreset = (preset) => {
    setActivePersona(preset);
    if (preset === 'itlc_india') {
      setBrandVoice({
        tone: 'pragmatic, staff engineer, hands-on, candid and insightful',
        formality: 'medium',
        paragraphLength: 'short to medium (2-3 sentences)',
        style: 'real-world architecture + production tradeoffs + clear code walk-throughs',
        ctaStyle: 'practical next step / technical action plan',
        targetAudience: 'Software Developers, CTOs, Enterprise IT Directors, and Tech Interns'
      });
      showToast('Applied ITLC India Tech Lead Persona!', 'success');
    } else if (preset === 'itlc_foundation') {
      setBrandVoice({
        tone: 'empathetic, inspiring, grassroots community-focused and warm',
        formality: 'medium',
        paragraphLength: 'short (2-4 sentences)',
        style: 'real human impact stories + ground reality + clear community invitation',
        ctaStyle: 'inspiring volunteer / donor action call',
        targetAudience: 'Citizens of Lucknow, Social Workers, Donors, and Volunteers'
      });
      showToast('Applied ITLC Foundation Community Persona!', 'success');
    }
  };

  const [sampleTextInput, setSampleTextInput] = useState('');
  const [showSampleInput, setShowSampleInput] = useState(false);

  const handleAutoExtract = async (withSample = false) => {
    setExtracting(true);
    showToast('Analyzing text with GenAI to discover natural brand voice...', 'info');
    try {
      const res = await SettingsAPI.extractBrandVoice({
        sampleText: withSample ? sampleTextInput : undefined
      });
      if (res.data?.brandVoice) {
        setBrandVoice(res.data.brandVoice);
        showToast('Brand voice successfully extracted with GenAI!', 'success');
        setShowSampleInput(false);
      }
    } catch (err) {
      showToast(`Extraction notice: ${err.message}`, 'error');
    } finally {
      setExtracting(false);
    }
  };

  const bannedPhrases = [
    "In today's fast-paced digital world",
    "Delve into / Dive deep",
    "It's important to remember / crucial to note",
    "Tapestry / Beacon / Symphony",
    "As we navigate / In conclusion",
    "Game-changer / Revolutionize",
    "Unlock the potential"
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />
            Brand Voice & Humanization Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure human writing tone, anti-AI guardrails, and portal-specific personas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSampleInput(!showSampleInput)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Paste Writing Sample</span>
          </button>
          <button
            onClick={() => handleAutoExtract(false)}
            disabled={extracting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${extracting ? 'animate-spin' : ''}`} />
            <span>{extracting ? 'Analyzing Corpus...' : 'Auto-Extract from Blogs'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Voice Profile'}</span>
          </button>
        </div>
      </div>

      {/* Paste Sample Box */}
      {showSampleInput && (
        <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-indigo-600" /> Paste Sample Writing to Analyze with GenAI
            </h3>
            <button onClick={() => setShowSampleInput(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
          </div>
          <textarea
            rows={4}
            placeholder="Paste 1-3 paragraphs of your favorite article, newsletter, or company blog to extract its tone..."
            value={sampleTextInput}
            onChange={(e) => setSampleTextInput(e.target.value)}
            className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleAutoExtract(true)}
              disabled={extracting || !sampleTextInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {extracting ? 'Extracting with GenAI...' : 'Extract Voice Profile from Sample'}
            </button>
          </div>
        </div>
      )}

      {/* Preset Persona Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => handleApplyPersonaPreset('itlc_india')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
            activePersona === 'itlc_india'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-slate-900">🏢 ITLC India Persona</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">itlcindia.com</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Staff Engineer voice: hands-on, architecture-focused, concrete code examples, real production tradeoffs.
            </p>
          </div>
        </div>

        <div
          onClick={() => handleApplyPersonaPreset('itlc_foundation')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
            activePersona === 'itlc_foundation'
              ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-slate-900">🏛️ ITLC Foundation Persona</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">itlcfoundation.com</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Grassroots Storyteller voice: compassionate, inspiring, human lives impact, real community initiatives.
            </p>
          </div>
        </div>
      </div>

      {/* Voice Parameters Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Editorial Tone</label>
            <input
              type="text"
              value={brandVoice.tone}
              onChange={(e) => setBrandVoice({ ...brandVoice, tone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Formality Level</label>
            <select
              value={brandVoice.formality}
              onChange={(e) => setBrandVoice({ ...brandVoice, formality: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="low">Low (Conversational, Casual, Direct)</option>
              <option value="medium">Medium (Professional, Natural & Accessible)</option>
              <option value="high">High (Academic, Enterprise Whitepaper)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Paragraph Cadence & Pacing</label>
            <input
              type="text"
              value={brandVoice.paragraphLength}
              onChange={(e) => setBrandVoice({ ...brandVoice, paragraphLength: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Call to Action (CTA) Style</label>
            <input
              type="text"
              value={brandVoice.ctaStyle}
              onChange={(e) => setBrandVoice({ ...brandVoice, ctaStyle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-700 font-bold block mb-1.5">Target Audience</label>
            <input
              type="text"
              value={brandVoice.targetAudience}
              onChange={(e) => setBrandVoice({ ...brandVoice, targetAudience: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Real-time Voice Preview */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5 text-xs">
          <span className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Active Gemini Prompt Directive:
          </span>
          <p className="text-indigo-800 leading-relaxed font-mono text-[11px]">
            "Write in a {brandVoice.tone} tone for {brandVoice.targetAudience}. Keep paragraphs {brandVoice.paragraphLength}, maintain {brandVoice.formality} formality, and conclude with a {brandVoice.ctaStyle} action item."
          </p>
        </div>
      </div>

      {/* Anti-AI & Humanization Guardrail Rules */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Anti-AI Cliché Filter & Humanization Guard</h2>
        </div>
        <p className="text-xs text-slate-500">
          The Gemini writing engine automatically filters out generic AI idioms and replaces them with authentic phrasing:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {bannedPhrases.map((phrase, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs">
              <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="font-semibold text-rose-800 line-through truncate">{phrase}</span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Active human rules: Relatable opening hooks, natural contractions (we've, don't), varied sentence cadence, and hands-on case studies.</span>
        </div>
      </div>
    </div>
  );
}
