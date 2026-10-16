'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { WebsiteBlock } from '@businessos/shared';
import {
  Globe,
  Smartphone,
  Monitor,
  Sparkles,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers,
  Palette,
  Eye,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Layout,
  FileText,
  Search,
  Check,
  Send,
  HelpCircle,
  Copy,
  Server,
  ArrowRight,
  TrendingUp,
  Users,
  MessageSquare,
  Bot,
  X,
} from 'lucide-react';

export default function AIWebsiteBuilderPage() {
  const { website, updateWebsiteBlock, publishWebsiteToggle, addCustomer, canAccess, addToast, refreshData, t } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'websites' | 'templates' | 'editor' | 'forms' | 'seo' | 'domains'
  >('overview');

  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [genStep, setGenStep] = useState(1);
  const [genName, setGenName] = useState('Lumina Luxe Spa');
  const [genType, setGenType] = useState('Salon & Spa');
  const [genTheme, setGenTheme] = useState('Luxury Gold');
  const [genServices, setGenServices] = useState('Hair Styling, Hydra-Facial, Aromatherapy');
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingHeading, setEditingHeading] = useState('');
  const [editingSubheading, setEditingSubheading] = useState('');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  const [leadFormName, setLeadFormName] = useState('');
  const [leadFormPhone, setLeadFormPhone] = useState('');

  const activePage = website.pages[0];
  const selectedBlock = activePage?.blocks.find((b) => b.id === selectedBlockId);

  const handleAiGenerationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/website/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: genName,
          industry: genType,
          services: genServices,
          theme: genTheme,
        }),
      });

      if (res.ok) {
        setIsAiGeneratorOpen(false);
        setGenStep(1);
        addToast({
          type: 'success',
          title: 'Website Generated',
          message: `Custom site live for ${genName} in Neon DB!`,
        });
        await refreshData();
      } else {
        const err = await res.json();
        addToast({ type: 'error', title: 'Generation Failed', message: err.error || 'Failed to generate website.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Network Error', message: 'Could not connect to AI Website Builder service.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectBlockForEditing = (block: WebsiteBlock) => {
    setSelectedBlockId(block.id);
    setEditingHeading(block.content.heading || '');
    setEditingSubheading(block.content.subheading || '');
  };

  const handleSaveBlockEdit = async () => {
    if (!selectedBlockId) return;
    await updateWebsiteBlock(selectedBlockId, { heading: editingHeading, subheading: editingSubheading });
    setSelectedBlockId(null);
  };

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormName || !leadFormPhone) return;
    addCustomer({ name: leadFormName, phone: leadFormPhone, tags: ['Website Lead'] });
    setLeadFormName('');
    setLeadFormPhone('');
    addToast({ type: 'success', title: 'Lead Captured', message: 'Added lead to CRM repository.' });
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>{t('website.websiteTitle', 'Storefront & Website Builder')}</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {website.isPublished ? t('website.published', 'Published Live') : t('website.unpublished', 'Draft Mode')}
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('website.websiteDesc', 'Customize your storefront, manage blocks, and publish online')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('website:write') ? (
            <button
              onClick={() => setIsAiGeneratorOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('website.generateWithAi', 'Generate Site with AI')}</span>
            </button>
          ) : (
            <span className="text-xs text-zinc-400 font-mono px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              Role: Restricted (Read Only)
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Funnel Overview', icon: Globe },
          { id: 'editor', label: 'Visual Block Editor', icon: Edit3 },
          { id: 'forms', label: 'Lead Capture Forms', icon: FileText },
          { id: 'seo', label: 'SEO & Metadata', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">{website.domainName}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">https://{website.subdomain}.businessos.app</p>
              </div>
              <button onClick={publishWebsiteToggle} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                {website.isPublished ? 'Unpublish Site' : 'Publish Live Now'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Monthly Visitors</span>
                <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">1,420 Unique Views</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Lead Conversions</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-display mt-1">42 Inquiries Submitted</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Form Completion Rate</span>
                <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">8.4% Conversion</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISUAL EDITOR TAB */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-100 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="font-bold text-zinc-900 dark:text-white">Live Canvas Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1.5 rounded-lg ${viewportMode === 'desktop' ? 'bg-zinc-900 text-white' : 'text-zinc-400'}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1.5 rounded-lg ${viewportMode === 'mobile' ? 'bg-zinc-900 text-white' : 'text-zinc-400'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`mx-auto transition-all ${viewportMode === 'mobile' ? 'max-w-sm' : 'w-full'} space-y-4`}>
              {activePage.blocks.map((block) => (
                <div
                  key={block.id}
                  onClick={() => handleSelectBlockForEditing(block)}
                  className={`p-6 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer ${
                    selectedBlockId === block.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 uppercase">
                    {block.type} BLOCK
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white mt-2">{block.content.heading}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{block.content.subheading}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
              {selectedBlock ? `Edit ${selectedBlock.type} Block` : 'Select a Block to Edit'}
            </h3>

            {selectedBlock ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Block Heading</label>
                  <input
                    type="text"
                    value={editingHeading}
                    onChange={(e) => setEditingHeading(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Subheading Copy</label>
                  <textarea
                    rows={3}
                    value={editingSubheading}
                    onChange={(e) => setEditingSubheading(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <button
                  onClick={handleSaveBlockEdit}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow transition-all"
                >
                  Save Block Changes
                </button>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Click any block in the canvas to customize text copy, call-to-actions, and background layouts.</p>
            )}
          </div>
        </div>
      )}

      {/* LEAD CAPTURE FORMS TAB */}
      {activeTab === 'forms' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">Test Live Lead Capture Form</h3>

          <form onSubmit={handleFormSubmission} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={leadFormName}
                onChange={(e) => setLeadFormName(e.target.value)}
                placeholder="Enter client name..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number (+91)</label>
              <input
                type="text"
                required
                value={leadFormPhone}
                onChange={(e) => setLeadFormPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow">
              Submit Form Lead
            </button>
          </form>
        </div>
      )}

      {/* SEO TAB */}
      {activeTab === 'seo' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">SEO & OpenGraph Metadata</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Meta Title</label>
              <input
                type="text"
                defaultValue={website.domainName}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Meta Description</label>
              <textarea
                rows={2}
                defaultValue="Lumina Luxe Spa — Premier luxury hair salon, hydra-facial aesthetics, and wellness spa in Mumbai."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* AI GENERATOR MODAL WIZARD */}
      {isAiGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>AI Website Builder Wizard</span>
              </h3>
              <button onClick={() => setIsAiGeneratorOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAiGenerationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={genName}
                  onChange={(e) => setGenName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Industry</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Salon & Spa">Salon & Spa</option>
                  <option value="Medical Clinic">Medical Clinic</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Fitness Gym">Fitness Gym</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Key Offerings / Services</label>
                <input
                  type="text"
                  value={genServices}
                  onChange={(e) => setGenServices(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsAiGeneratorOpen(false)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isGenerating} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow flex items-center gap-1.5">
                  {isGenerating ? 'Building Site...' : 'Generate AI Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
