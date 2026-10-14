import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Wand2,
  FileText,
  Eye,
  Edit3
} from 'lucide-react';
import { BlogAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function RichEditor({
  value,
  onChange,
  title,
  onRewriteComplete,
  readOnly = false
}) {
  const [activeTab, setActiveTab] = useState('split'); // 'edit', 'preview', 'split'
  const [copied, setCopied] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [showRewriteBar, setShowRewriteBar] = useState(false);
  const { showToast } = useApp();

  const words = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.round(words / 220));

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeAIRewrite = async (instruction, tone = 'educational + humanized') => {
    if (!value) return;
    setIsRewriting(true);
    try {
      showToast(`AI refining content: "${instruction}"...`, 'info');
      const res = await BlogAPI.rewrite({
        content: value,
        instruction,
        targetTone: tone
      });
      if (res.data?.revisedContent) {
        onChange(res.data.revisedContent);
        if (onRewriteComplete) onRewriteComplete(res.data.revisedContent);
        showToast('AI Content refinement complete!', 'success');
        setShowRewriteBar(false);
      }
    } catch (err) {
      showToast(`Rewrite error: ${err.message}`, 'error');
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Editor Top Toolbar */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'edit' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'split' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Split
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'preview' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            <span className="font-bold text-white">{words}</span> words · <span className="font-bold text-sky-400">{readingTime} min</span> read
          </div>
        </div>

        {/* AI Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRewriteBar(!showRewriteBar)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Polish</span>
          </button>
          <button
            onClick={() => executeAIRewrite('Improve SEO keyword density and optimize heading hierarchy without fluff')}
            disabled={isRewriting}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
          >
            <span>Optimize SEO</span>
          </button>
          <button
            onClick={() => executeAIRewrite('Expand each section with more concrete examples, benchmarks, and actionable steps')}
            disabled={isRewriting}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
          >
            <span>Expand</span>
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* AI Custom Polish Bar */}
      {showRewriteBar && (
        <div className="p-3 bg-indigo-950/40 border-b border-indigo-900/50 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
          <input
            type="text"
            placeholder="Tell AI how to refine (e.g. 'Make the introduction punchier', 'Add a comparison table', 'Simplify tone')..."
            value={rewriteInstruction}
            onChange={(e) => setRewriteInstruction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeAIRewrite(rewriteInstruction)}
            className="w-full bg-slate-900/80 border border-indigo-800/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => executeAIRewrite(rewriteInstruction)}
            disabled={isRewriting || !rewriteInstruction.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isRewriting ? 'Refining...' : 'Apply'}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden min-h-[500px]">
        {/* Markdown Source Code */}
        {(activeTab === 'edit' || activeTab === 'split') && (
          <div className={`p-4 ${activeTab === 'split' ? 'border-r border-slate-800' : 'col-span-2'} flex flex-col h-full bg-[#080C14]`}>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              readOnly={readOnly}
              placeholder="# Enter your blog post markdown here..."
              className="w-full h-full bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none p-2 selection:bg-brand-500 selection:text-white"
            />
          </div>
        )}

        {/* Live Formatted Markdown Preview */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className={`p-4 sm:p-8 overflow-y-auto overflow-x-hidden ${activeTab === 'preview' ? 'col-span-2' : ''} bg-slate-900/40 prose prose-invert max-w-none text-xs sm:text-sm min-w-0 break-words`}>
            {value ? (
              <div className="space-y-4 min-w-0">
                {value.split('\n\n').map((block, i) => {
                  block = block.trim();
                  if (!block) return null;
                  if (block.startsWith('# ')) {
                    return <h1 key={i} className="text-xl sm:text-2xl font-black text-white tracking-tight pb-2 border-b border-slate-800 break-words">{block.replace('# ', '')}</h1>;
                  }
                  if (block.startsWith('## ')) {
                    return <h2 key={i} className="text-base sm:text-lg font-bold text-sky-300 pt-3 break-words">{block.replace('## ', '')}</h2>;
                  }
                  if (block.startsWith('### ')) {
                    return <h3 key={i} className="text-sm font-semibold text-slate-200 pt-1 break-words">{block.replace('### ', '')}</h3>;
                  }
                  // Table support
                  if (block.includes('|') && block.split('\n').every(l => l.trim().startsWith('|') && l.trim().endsWith('|'))) {
                    const rows = block.split('\n').filter(r => !r.includes('---'));
                    if (rows.length > 0) {
                      const headers = rows[0].split('|').filter(c => c.trim().length > 0);
                      const bodyRows = rows.slice(1);
                      return (
                        <div key={i} className="overflow-x-auto max-w-full my-3 rounded-xl border border-slate-800">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-950 border-b border-slate-800">
                                {headers.map((h, hi) => (
                                  <th key={hi} className="p-2.5 font-bold text-sky-300">{h.trim()}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {bodyRows.map((br, bi) => {
                                const cells = br.split('|').filter(c => c.trim().length > 0);
                                return (
                                  <tr key={bi} className="border-b border-slate-800/60 hover:bg-slate-950/40">
                                    {cells.map((c, ci) => (
                                      <td key={ci} className="p-2.5 text-slate-300">{c.trim()}</td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                  }
                  if (block.startsWith('```')) {
                    const code = block.replace(/```[a-z]*\n?/gi, '');
                    return (
                      <pre key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto max-w-full my-3 whitespace-pre min-w-0">
                        <code className="block min-w-0">{code}</code>
                      </pre>
                    );
                  }
                  if (block.startsWith('- ') || block.startsWith('* ')) {
                    const items = block.split('\n').filter(Boolean);
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1 text-slate-300">
                        {items.map((it, idx) => (
                          <li key={idx} className="break-words">{it.replace(/^[-*]\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="text-slate-300 leading-relaxed break-words">{block}</p>;
                })}
              </div>
            ) : (
              <p className="text-slate-600 italic">No content generated yet. Use the AI Writer on the left to create a full blog post.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
