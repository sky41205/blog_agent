import React, { useState, useEffect } from 'react';
import {
  ListTree,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  BookOpen,
  Sparkles,
  HelpCircle,
  Wand2
} from 'lucide-react';

export default function ResearchOutlineEditor({
  researchBrief = null,
  outlineData = null,
  onUpdateOutline,
  onUpdateResearch
}) {
  const [activeSubTab, setActiveSubTab] = useState('outline'); // 'outline' | 'research'
  const [editingOutline, setEditingOutline] = useState(outlineData || {});
  const [editingResearch, setEditingResearch] = useState(researchBrief || {});

  useEffect(() => {
    if (outlineData) setEditingOutline(outlineData);
  }, [outlineData]);

  useEffect(() => {
    if (researchBrief) setEditingResearch(researchBrief);
  }, [researchBrief]);

  const formatVisualNote = (vis) => {
    if (!vis) return '';
    if (typeof vis === 'string') return vis;
    if (typeof vis === 'object') {
      return vis.concept || vis.value || vis.type || JSON.stringify(vis);
    }
    return String(vis);
  };

  const formatTextItem = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
      return item.text || item.point || item.claim || item.title || item.value || JSON.stringify(item);
    }
    return String(item);
  };

  const sections = editingOutline?.outline || [];

  const handleUpdateSectionHeading = (index, newHeading) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], heading: newHeading };
    const newOut = { ...editingOutline, outline: updated };
    setEditingOutline(newOut);
    if (onUpdateOutline) onUpdateOutline(newOut);
  };

  const handleAddSection = () => {
    const newSec = {
      id: `section-${Date.now().toString().slice(-4)}`,
      heading: 'New Section Heading',
      level: 2,
      estimatedWords: 250,
      keyPoints: ['Key takeaway to explore'],
      proposedVisual: null
    };
    const updated = [...sections, newSec];
    const newOut = { ...editingOutline, outline: updated };
    setEditingOutline(newOut);
    if (onUpdateOutline) onUpdateOutline(newOut);
  };

  const handleDeleteSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    const newOut = { ...editingOutline, outline: updated };
    setEditingOutline(newOut);
    if (onUpdateOutline) onUpdateOutline(newOut);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('outline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'outline'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Content Strategy & Outline (Agent 2)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('research')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'research'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Research & Fact-Checking (Agent 1)</span>
          </button>
        </div>

        {activeSubTab === 'outline' && (
          <button
            onClick={handleAddSection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>
        )}
      </div>

      {/* VIEW: OUTLINE TAB */}
      {activeSubTab === 'outline' && (
        <div className="space-y-4">
          {editingOutline.contentAngle && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Unique Content Angle:
              </span>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                {editingOutline.contentAngle}
              </p>
            </div>
          )}

          {/* Heading Sections List */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 block">
              Hierarchical Heading Outline (Editable):
            </span>

            {sections.map((sec, idx) => (
              <div
                key={sec.id || idx}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-slate-100 text-slate-700">
                      H{sec.level || 2}
                    </span>
                    <input
                      type="text"
                      value={sec.heading}
                      onChange={(e) => handleUpdateSectionHeading(idx, e.target.value)}
                      className="w-full font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none text-xs pb-0.5"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {sec.proposedVisual && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Visual Planned</span>
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteSection(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {sec.keyPoints && sec.keyPoints.length > 0 && (
                  <div className="pl-6 text-[11px] text-slate-500 space-y-0.5">
                    {sec.keyPoints.map((pt, pIdx) => (
                      <div key={pIdx}>• {formatTextItem(pt)}</div>
                    ))}
                  </div>
                )}

                {sec.proposedVisual && (
                  <div className="pl-6 pt-1 text-[11px] text-purple-900 italic font-medium">
                    ↳ Visual Note: {formatVisualNote(sec.proposedVisual)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: RESEARCH TAB */}
      {activeSubTab === 'research' && (
        <div className="space-y-4 text-xs">
          {/* Target Audience & Search Intent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Search Intent & Goal:
              </span>
              <p className="font-bold text-slate-900">{formatTextItem(editingResearch.searchIntent) || 'Informational / Problem-Solving'}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Audience Profile:
              </span>
              <p className="font-bold text-slate-900">
                {formatTextItem(editingResearch.targetAudience?.profile || editingResearch.targetAudience) || 'Engineers, Practitioners, Decision Makers'}
              </p>
            </div>
          </div>

          {/* Uncertain Claims Flags */}
          {editingResearch.uncertainClaims && editingResearch.uncertainClaims.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Information Flagged (Cannot Be Independently Verified):</span>
              </div>
              <div className="space-y-1.5 pl-2">
                {editingResearch.uncertainClaims.map((uc, i) => (
                  <div key={i} className="text-[11px] text-amber-950">
                    • <strong>{formatTextItem(uc.claim || uc)}:</strong> <span className="italic text-amber-800">{formatTextItem(uc.flagReason || 'Unverified')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Facts */}
          {editingResearch.verifiedFacts && editingResearch.verifiedFacts.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">Verified Facts & Benchmarks:</span>
              <div className="space-y-2">
                {editingResearch.verifiedFacts.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-xs">
                        <span className="text-emerald-500 font-bold mr-1">✓</span>
                        {formatTextItem(f.claim || f)}
                      </p>
                      {f.sourceUrl && (
                        <a
                          href={f.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Source</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Citations */}
          {editingResearch.sourceCitations && editingResearch.sourceCitations.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="font-bold text-slate-900 block">Source Citations:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {editingResearch.sourceCitations.map((c, i) => (
                  <a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all space-y-1 group block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 group-hover:text-indigo-600 text-xs line-clamp-1">
                        {formatTextItem(c.title || c)}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                    </div>
                    {c.factSnippet && (
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        {formatTextItem(c.factSnippet)}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
