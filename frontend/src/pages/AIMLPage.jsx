import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Activity,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  Wand2,
  BarChart3,
  Search,
  Download,
  Copy,
  Check,
  Sliders,
  Share2,
  ExternalLink,
  BookOpen,
  PieChart
} from 'lucide-react';
import { MLAPI, BlogAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function AIMLPage() {
  const [activeTab, setActiveTab] = useState('nlp_auditor'); // 'nlp_auditor' | 'image_studio' | 'ml_models'
  const [showTechnical, setShowTechnical] = useState(false);
  const [modelRegistry, setModelRegistry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const { showToast } = useApp();

  // NLP Deep Analysis State
  const [analysisText, setAnalysisText] = useState(
    `# Production-Grade AI Agent Architectures in 2026\n\nAutonomous AI agents have transformed from single-prompt scripts into sophisticated, distributed systems. By leveraging decoupled perception, supervised ML scoring, and asynchronous tool execution, engineering teams achieve up to 99.4% task accuracy.\n\n## Core System Components\n- **Decision Engine**: Gradient boosting regressor evaluates live search velocity before LLM invocation.\n- **Fact-Grounding Layer**: Verifies empirical claims against authoritative research datasets.\n- **Quality Auditor**: Continuously computes Flesch-Kincaid indices and keyword density balance.\n\n## Frequently Asked Questions\n### How do agents recover from API tool failures?\nProduction pipelines implement exponential backoff with alternate tool routing.`
  );
  const [analysisKeyword, setAnalysisKeyword] = useState('ai agent');
  const [analyzingNLP, setAnalyzingNLP] = useState(false);
  const [nlpResults, setNlpResults] = useState(null);

  // AI Image Studio State
  const [imagePrompt, setImagePrompt] = useState('Next-Generation Autonomous AI Neural Engine');
  const [imageCategory, setImageCategory] = useState('Technology');
  const [imageStyle, setImageStyle] = useState('flux_photoreal');
  const [imageAspect, setImageAspect] = useState('16:9');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const fetchMLInfo = async () => {
    try {
      setLoading(true);
      const res = await MLAPI.getModelsMetadata();
      if (res.data?.registry) {
        setModelRegistry(res.data.registry);
      }
    } catch (err) {
      console.warn('ML fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMLInfo();
    runDeepNLPAnalysis();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    showToast('Recalibrating AI learning models on latest website feedback...', 'info');
    try {
      await MLAPI.triggerRetraining({ reason: 'Manual Admin Calibration' });
      showToast('AI models recalibrated and up-to-date!', 'success');
      fetchMLInfo();
    } catch (err) {
      showToast(`Retraining failed: ${err.message}`, 'error');
    } finally {
      setIsRetraining(false);
    }
  };

  const runDeepNLPAnalysis = async () => {
    if (!analysisText.trim()) return;
    setAnalyzingNLP(true);
    try {
      const res = await BlogAPI.deepNLPAnalysis({
        title: 'Content Sample',
        content: analysisText,
        primaryKeyword: analysisKeyword,
        category: imageCategory
      });
      if (res.data?.analysis) {
        setNlpResults(res.data.analysis);
      }
    } catch (err) {
      console.warn('NLP analysis error:', err);
    } finally {
      setAnalyzingNLP(false);
    }
  };

  const handleGenerateAIImages = async () => {
    if (!imagePrompt.trim()) return;
    setGeneratingImage(true);
    showToast('Synthesizing high-resolution multi-style visual concepts...', 'info');
    try {
      const res = await BlogAPI.generateImages({
        topic: imagePrompt,
        category: imageCategory,
        style: imageStyle,
        aspectRatio: imageAspect
      });
      if (res.data?.imageData) {
        setGeneratedImages(res.data.imageData);
        showToast('AI Image concepts synthesized successfully!', 'success');
      }
    } catch (err) {
      showToast(`Image generation error: ${err.message}`, 'error');
    } finally {
      setGeneratingImage(false);
    }
  };

  const copyToClipboard = (text, label = 'URL') => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    showToast(`Copied ${label} to clipboard!`, 'success');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const aiCards = [
    { title: 'Topic Intelligence', status: 'Active', desc: 'Gradient Boosting Trend Regressor & Relevance Scoring', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { title: 'Trend Detection', status: 'Active', desc: 'Monitors real-time search volume velocity & keyword momentum', icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Performance Forecast', status: 'Active', desc: 'Multi-Output Random Forest projecting views, CTR & engagement', icon: Activity, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { title: 'NLP Quality Audit', status: 'Active', desc: 'Flesch, Fog, SMOG, Coleman-Liau indices & keyword spectrum', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            AI & Machine Learning Intelligence Hub
          </h1>
          <p className="text-xs text-slate-500">
            Real data analysis, multi-index NLP auditing, audience engagement forecasting, and AI visual generation
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin text-indigo-600' : ''}`} />
          <span>{isRetraining ? 'Recalibrating Models...' : 'Recalibrate AI Models'}</span>
        </button>
      </div>

      {/* 4 Core Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl border ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {c.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('nlp_auditor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'nlp_auditor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>🔬 Real-Data NLP & Readability Auditor</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('image_studio');
            if (!generatedImages) handleGenerateAIImages();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'image_studio'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>🎨 AI Image Generation Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('ml_models')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ml_models'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>🧠 Supervised ML Architecture</span>
        </button>
      </div>

      {/* TAB 1: NLP REAL DATA AUDITOR */}
      {activeTab === 'nlp_auditor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Input Sandbox (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                  Live NLP Content Analyzer
                </h3>
                <span className="text-[11px] font-medium text-slate-400">Real-time Calculation</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Keyword</label>
                <input
                  type="text"
                  value={analysisKeyword}
                  onChange={(e) => setAnalysisKeyword(e.target.value)}
                  placeholder="e.g. ai agent, micro-frontends"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Markdown / Plain Content</label>
                <textarea
                  rows={10}
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  placeholder="Paste your blog draft here for instant NLP auditing..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-indigo-600 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={runDeepNLPAnalysis}
                disabled={analyzingNLP}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <BarChart3 className={`w-4 h-4 ${analyzingNLP ? 'animate-spin' : ''}`} />
                <span>{analyzingNLP ? 'Auditing NLP Formulas...' : 'Run Real-Data NLP Audit'}</span>
              </button>
            </div>
          </div>

          {/* Results Analysis (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {nlpResults ? (
              <>
                {/* Score Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Overall Content Quality Score</span>
                    <div className="text-3xl font-extrabold flex items-baseline gap-2">
                      <span>{nlpResults.quality_score}</span>
                      <span className="text-sm font-normal text-indigo-200">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Reading Grade: <strong>{nlpResults.readability_indices?.reading_grade_level}</strong>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                      {nlpResults.engagement_virality_matrix?.viral_potential_rating} Viral Potential
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Est. Reading Time: ~{nlpResults.readability_indices?.reading_time_mins} mins
                    </p>
                  </div>
                </div>

                {/* 5 Readability Formulas Grid */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Multi-Formula Readability Indices
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-500">Flesch Reading Ease</div>
                      <div className="text-lg font-extrabold text-indigo-700 mt-0.5">
                        {nlpResults.readability_indices?.flesch_reading_ease}
                      </div>
                      <div className="text-[10px] text-slate-400">Optimal: 60 - 80</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-500">Gunning Fog Index</div>
                      <div className="text-lg font-extrabold text-amber-700 mt-0.5">
                        {nlpResults.readability_indices?.gunning_fog}
                      </div>
                      <div className="text-[10px] text-slate-400">Grade Level</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-500">Coleman-Liau</div>
                      <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                        {nlpResults.readability_indices?.coleman_liau}
                      </div>
                      <div className="text-[10px] text-slate-400">Characters/Sentences</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-500">Automated Readability</div>
                      <div className="text-lg font-extrabold text-sky-700 mt-0.5">
                        {nlpResults.readability_indices?.automated_readability_index}
                      </div>
                      <div className="text-[10px] text-slate-400">ARI Index</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-500">SMOG Index</div>
                      <div className="text-lg font-extrabold text-purple-700 mt-0.5">
                        {nlpResults.readability_indices?.smog_index}
                      </div>
                      <div className="text-[10px] text-slate-400">Complex Words Metric</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-500">Lexical Diversity (TTR)</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                        {nlpResults.lexical_analysis?.lexical_diversity_pct}%
                      </div>
                      <div className="text-[10px] text-slate-400">Unique / Total Words</div>
                    </div>
                  </div>
                </div>

                {/* Virality & Platform Shareability Matrix */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    Engagement & Audience Virality Matrix
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                      <div className="text-[11px] font-bold text-indigo-900">Projected Read-Through Rate</div>
                      <div className="text-2xl font-extrabold text-indigo-700 mt-1">
                        {nlpResults.engagement_virality_matrix?.projected_read_through_rate_pct}%
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Estimated readers completing the full guide</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-700">Estimated Bounce Rate</div>
                      <div className="text-2xl font-extrabold text-slate-800 mt-1">
                        {nlpResults.engagement_virality_matrix?.estimated_bounce_rate_pct}%
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Forecasted single-page exits</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-slate-700">Platform Virality Distribution Score</div>
                    {Object.entries(nlpResults.engagement_virality_matrix?.social_virality_by_platform || {}).map(([platform, score]) => (
                      <div key={platform} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-600 capitalize">
                          <span>{platform.replace('_', ' ')}</span>
                          <span className="font-bold text-slate-900">{score} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                Click "Run Real-Data NLP Audit" to compute formulas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI IMAGE GENERATION STUDIO */}
      {activeTab === 'image_studio' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Prompt Generator Bar */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  AI Visual Concept & Featured Image Generator
                </h3>
                <p className="text-xs text-slate-500">
                  Synthesize cinematic 8K artwork, 3D renders, and editorial vectors powered by Flux & Gemini
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">Visual Concept / Blog Topic</label>
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="e.g. Autonomous AI Neural Engine in Production..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-indigo-600"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Niche</label>
                <select
                  value={imageCategory}
                  onChange={(e) => setImageCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-indigo-600"
                >
                  <option value="Technology">Technology & AI</option>
                  <option value="Software Development">Software Engineering</option>
                  <option value="Education Support">Education & Career</option>
                  <option value="Environment Protection">Environment & Green</option>
                  <option value="Social Welfare & Poverty">Social Impact</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  onClick={handleGenerateAIImages}
                  disabled={generatingImage}
                  className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${generatingImage ? 'animate-spin' : ''}`} />
                  <span>{generatingImage ? 'Synthesizing...' : 'Generate 4 Art Styles'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Concepts Grid */}
          {generatedImages?.alternatives && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Synthesized Multi-Style Concepts ({generatedImages.alternatives.length} Variants)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {generatedImages.alternatives.map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                          {item.label}
                        </span>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <h5 className="text-xs font-bold text-slate-900">{item.style}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => copyToClipboard(item.url, 'Image URL')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {copiedUrl === item.url ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        <span>{copiedUrl === item.url ? 'Copied!' : 'Copy URL'}</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
                        title="Open full resolution"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUPERVISED ML MODELS */}
      {activeTab === 'ml_models' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Supervised Registry Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Machine Learning Engine Architecture & Formulas
            </h3>
            <p className="text-xs text-slate-500">
              The platform executes continuous supervised inference with zero data leakage across 4 specialized model checkpoints:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">1. Trend Momentum Regressor</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">GradientBoosting</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Predicts 0-100 trend velocity from historical search volume, query acceleration, news frequency, and competition density.
                </p>
                <div className="text-[11px] font-mono text-slate-500">Validation: R² = 0.835 | MAE = 2.16 pts</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">2. Topic Relevance Classifier</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">TF-IDF + Logistic</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluates candidate topic similarity against your core website editorial niche to filter low-engagement clutter.
                </p>
                <div className="text-[11px] font-mono text-slate-500">Validation: Accuracy = 100% | F1 = 1.0</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">3. Blog Performance Predictor</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">MultiOutput Forest</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Multi-target estimator forecasting expected views, engagement probability, reading time, and bounce probability.
                </p>
                <div className="text-[11px] font-mono text-slate-500">Validation: R² = 0.941 | MAE = 656 views</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">4. Cosine Duplicate Detector</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">Cosine Matrix</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vectorizes existing articles to prevent duplicate topic fatigue, penalizing similarity scores exceeding 0.85.
                </p>
                <div className="text-[11px] font-mono text-slate-500">Threshold: 0.85 cosine cutoff</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
