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
  const { website, updateWebsiteBlock, publishWebsiteToggle, addCustomer, canAccess, addToast } = useApp();

  // Primary Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'websites' | 'templates' | 'editor' | 'forms' | 'seo' | 'domains'
  >('overview');

  // AI Generator Modal Wizard State
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [genStep, setGenStep] = useState(1);
  const [genName, setGenName] = useState('Lumina Luxe Spa');
  const [genType, setGenType] = useState('Salon & Spa');
  const [genCity, setGenCity] = useState('Hyderabad');
  const [genDesc, setGenDesc] = useState('Premier aesthetic skincare and luxury massage spa.');
  const [genServices, setGenServices] = useState('Hydra-Facial, Aromatherapy Massage, Styling');
  const [genBrandStyle, setGenBrandStyle] = useState('Premium');

  // Editor State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('blk-1');

  // SEO Form State
  const [pageTitle, setPageTitle] = useState('Lumina Luxe Spa & Salon | Luxury Skincare');
  const [metaDesc, setMetaDesc] = useState('Experience Hyderabad premier hydra-facials, body massages, and precision hair styling.');
  const [ogImage, setOgImage] = useState('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200');

  // Form Test Submissions State
  const [formTestName, setFormTestName] = useState('');
  const [formTestPhone, setFormTestPhone] = useState('');

  const currentPage = website.pages[0];
  const selectedBlock = currentPage.blocks.find((b) => b.id === selectedBlockId) || currentPage.blocks[0];

  const [editTitle, setEditTitle] = useState(selectedBlock.title);
  const [editSubtitle, setEditSubtitle] = useState(selectedBlock.subtitle || '');

  // Templates List
  const templates = [
    { id: 'tmpl-1', name: 'Premium Slate', style: 'Premium', color: '#0F172A', active: true },
    { id: 'tmpl-2', name: 'Minimal Radiance', style: 'Minimal', color: '#3B82F6', active: false },
    { id: 'tmpl-3', name: 'Executive Dark', style: 'Professional', color: '#020617', active: false },
    { id: 'tmpl-4', name: 'Botanical Spa', style: 'Salon', color: '#059669', active: false },
    { id: 'tmpl-5', name: 'Urban Bistro', style: 'Restaurant', color: '#D97706', active: false },
    { id: 'tmpl-6', name: 'Modern Agency', style: 'Agency', color: '#6366F1', active: false },
  ];

  const handleApplyTemplate = (templateName: string) => {
    addToast({ type: 'success', title: 'Template Applied', message: `Loaded '${templateName}' layout style.` });
  };

  const handleAiGeneratorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiGeneratorOpen(false);
    setGenStep(1);

    // AI Structured JSON Generator Simulation
    updateWebsiteBlock('blk-1', {
      title: `Welcome to ${genName}`,
      subtitle: `${genDesc} Located in ${genCity}.`,
    });

    addToast({
      type: 'success',
      title: 'AI Website Structure Generated',
      message: `Created structured pages for ${genName} (${genBrandStyle} theme).`,
    });
  };

  const handleSaveBlockText = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteBlock(selectedBlockId, {
      title: editTitle,
      subtitle: editSubtitle,
    });
  };

  const handleTestFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTestName || !formTestPhone) return;

    addCustomer({
      name: formTestName,
      phone: formTestPhone,
      tags: ['Website Lead'],
      status: 'ACTIVE',
      lifetimeValue: 0,
    });

    setFormTestName('');
    setFormTestPhone('');
    addToast({ type: 'success', title: 'Form Submitted', message: 'Lead captured & added to Customers module.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Website Builder & Hosting</h1>
          <p className="text-xs text-slate-500 mt-1">Structured JSON website generator, block editor, templates, and lead forms.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiGeneratorOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Website with AI</span>
          </button>
        </div>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-wrap gap-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'websites', label: 'Websites' },
          { id: 'templates', label: 'Templates' },
          { id: 'editor', label: 'Block Editor' },
          { id: 'forms', label: 'Forms & Leads' },
          { id: 'seo', label: 'SEO Settings' },
          { id: 'domains', label: 'Domains' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW (WEBSITE DASHBOARD) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-medium text-slate-500 uppercase">Website Status</span>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    website.isPublished
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  {website.isPublished ? 'Published & Live' : 'Draft Mode'}
                </span>
                <button onClick={publishWebsiteToggle} className="text-xs text-blue-600 font-bold hover:underline">
                  Toggle
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-medium text-slate-500 uppercase">Unique Visitors</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">1,420</p>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +24% this month
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-medium text-slate-500 uppercase">Leads Generated</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">38</p>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Injected to Customers CRM</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-medium text-slate-500 uppercase">Active Forms</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Contact, Lead, Booking CTA</span>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-blue-400 font-mono">Live Subdomain Endpoint</span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>https://{website.subdomain}.businessos.app</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="text-xs text-slate-400">Last Published: {new Date(website.updatedAt).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setActiveTab('editor')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              Open Block Editor
            </button>
          </div>
        </div>
      )}

      {/* WEBSITES TAB */}
      {activeTab === 'websites' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Your Business Websites</h3>
            <span className="text-xs text-slate-500">1 Website Configured</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                W
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{website.domainName}</h4>
                <p className="text-[11px] text-slate-500">https://{website.subdomain}.businessos.app</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                ACTIVE
              </span>
              <button
                onClick={() => setActiveTab('editor')}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Edit Site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900">Choose Website Template Style</h3>
            <p className="text-xs text-slate-500 mt-0.5">All templates share the unified structured JSON data model.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{tmpl.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {tmpl.style}
                    </span>
                  </div>
                  <div className="h-24 rounded-xl bg-slate-950 p-3 flex flex-col justify-center text-white space-y-1">
                    <span className="text-[10px] font-bold text-blue-400">{tmpl.name} Hero</span>
                    <span className="text-[9px] text-slate-400">Sample structured block styling...</span>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyTemplate(tmpl.name)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  Apply {tmpl.style} Style
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BLOCK EDITOR TAB */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Block Library (3 Cols) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Block Library
            </h3>
            <div className="space-y-2">
              {currentPage.blocks.map((blk) => (
                <button
                  key={blk.id}
                  onClick={() => {
                    setSelectedBlockId(blk.id);
                    setEditTitle(blk.title);
                    setEditSubtitle(blk.subtitle || '');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all ${
                    selectedBlockId === blk.id
                      ? 'bg-blue-50 border-blue-300 font-bold text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block uppercase text-[10px] text-slate-400 font-mono">{blk.type}</span>
                  <span className="truncate block">{blk.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Center Canvas (6 Cols) */}
          <div className="lg:col-span-6 bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center min-h-[500px]">
            <div className="flex items-center justify-between w-full pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono text-[10px]">LIVE CANVAS</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button onClick={() => setPreviewDevice('desktop')} className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-slate-800 text-white' : ''}`}>
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setPreviewDevice('mobile')} className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-slate-800 text-white' : ''}`}>
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className={`mt-4 bg-slate-900 rounded-2xl p-6 text-white space-y-6 border border-slate-800 transition-all ${previewDevice === 'desktop' ? 'w-full' : 'w-[300px]'}`}>
              <div className="text-center space-y-2">
                <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {selectedBlock.type} BLOCK
                </span>
                <h2 className="text-lg font-bold">{selectedBlock.title}</h2>
                <p className="text-xs text-slate-400">{selectedBlock.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Right Properties Panel (3 Cols) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Block Settings
            </h3>
            <form onSubmit={handleSaveBlockText} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <textarea
                  rows={3}
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow">
                Save Block
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FORMS TAB */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Website Lead Forms</h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Contact Us Form</h4>
                  <p className="text-[10px] text-slate-500">Destination: Customers CRM</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Test Submission */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Test Lead Form Submission</h3>
            <form onSubmit={handleTestFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Test Client"
                  value={formTestName}
                  onChange={(e) => setFormTestName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+91 99999 00000"
                  value={formTestPhone}
                  onChange={(e) => setFormTestPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow">
                Submit Test Lead
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEO TAB */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">SEO Meta Tags & Sitemap</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Page Meta Title</label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <button onClick={() => addToast({ type: 'success', title: 'SEO Saved', message: 'Meta tags updated.' })} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow">
              Save Meta Settings
            </button>
          </div>
        </div>
      )}

      {/* DOMAINS TAB */}
      {activeTab === 'domains' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Custom Domain Configuration</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-900">Custom Domain: luminaluxe.com</span>
            <p className="text-slate-500">Add a CNAME DNS record pointing <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">@</code> to <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">lumina-luxe.businessos.app</code>.</p>
            <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
              DNS Verification Pending
            </span>
          </div>
        </div>
      )}

      {/* AI GENERATOR MODAL WIZARD */}
      {isAiGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Website Structure Wizard (Step {genStep} of 3)</span>
              </h3>
              <button onClick={() => setIsAiGeneratorOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAiGeneratorSubmit} className="space-y-4">
              {genStep === 1 && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={genName}
                      onChange={(e) => setGenName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={genCity}
                      onChange={(e) => setGenCity(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </>
              )}

              {genStep === 2 && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Business Description</label>
                    <textarea
                      rows={2}
                      value={genDesc}
                      onChange={(e) => setGenDesc(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Core Services</label>
                    <input
                      type="text"
                      value={genServices}
                      onChange={(e) => setGenServices(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </>
              )}

              {genStep === 3 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Visual Style</label>
                  <select
                    value={genBrandStyle}
                    onChange={(e) => setGenBrandStyle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Premium">Premium Slate</option>
                    <option value="Minimal">Minimal Modern</option>
                    <option value="Bold">Bold & Vibrant</option>
                    <option value="Warm">Warm Botanical</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {genStep > 1 ? (
                  <button type="button" onClick={() => setGenStep((s) => s - 1)} className="text-xs text-slate-600 font-bold">
                    Back
                  </button>
                ) : <div />}

                {genStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setGenStep((s) => s + 1)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow"
                  >
                    Next Step
                  </button>
                ) : (
                  <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow">
                    Generate Structured Website
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
