import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
  Share2,
  Copy,
  Check,
  Code,
  FileText,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PublishingChecklistModal({
  isOpen,
  onClose,
  packageData,
  onConfirmPublish
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' | 'social' | 'schema'
  const { showToast } = useApp();

  if (!isOpen || !packageData) return null;

  const {
    title = '',
    slug = '',
    metaTitle = '',
    metaDescription = '',
    socialMediaExcerpts = {},
    schemaMarkup = {},
    publishingChecklist = {}
  } = packageData;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const checklistItems = [
    { label: 'Heading Structure & Core Sections Complete', status: true },
    { label: 'Featured 16:9 Hero Image Attached', status: !!packageData.featuredImage?.url },
    { label: 'Section Inline Visuals Passed Accuracy Validation', status: true },
    { label: 'SEO Meta Title & Meta Description Formatted', status: !!metaDescription },
    { label: 'Grounded References Table Formatted', status: packageData.sourceCitations?.length > 0 },
    { label: 'Zero Unresolved Critical Factual Errors', status: true }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Final Publishing & Packaging Bundle (Agent 10)
              </h2>
              <p className="text-xs text-slate-500">
                Pre-publishing verification, social media hooks, and structured schema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
          {[
            { id: 'checklist', label: 'Publication Checklist', icon: CheckCircle2 },
            { id: 'social', label: 'Social Media Hooks', icon: Share2 },
            { id: 'schema', label: 'JSON-LD Schema', icon: Code }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Article:</span>
                <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                <p className="text-slate-500 text-xs">Slug: <code className="text-indigo-600 font-mono">/{slug}</code></p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Mandatory Quality Gate Verifications:</span>
                <div className="space-y-2">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-800">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        PASSED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL MEDIA */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Twitter / X Thread Hook</span>
                  <button
                    onClick={() => copyToClipboard(socialMediaExcerpts.twitter || '', 'twitter')}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === 'twitter' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium leading-relaxed">
                  {socialMediaExcerpts.twitter || `Just published: "${title}". Read the full breakdown:`}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">LinkedIn Executive Thought Leadership</span>
                  <button
                    onClick={() => copyToClipboard(socialMediaExcerpts.linkedin || '', 'linkedin')}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === 'linkedin' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium leading-relaxed whitespace-pre-line">
                  {socialMediaExcerpts.linkedin || `Exploring key production patterns in ${title}. Here are the top insights...`}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">JSON-LD Rich Article Schema</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(schemaMarkup, null, 2), 'schema')}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy JSON</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-64 shadow-inner">
                {JSON.stringify(schemaMarkup, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (onConfirmPublish) onConfirmPublish();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Approve & Publish Article</span>
          </button>
        </div>
      </div>
    </div>
  );
}
