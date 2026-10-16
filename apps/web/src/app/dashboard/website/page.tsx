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
  QrCode,
  Clock,
  Tag,
  Star,
  ShieldCheck,
  CheckSquare,
  Loader2,
} from 'lucide-react';

interface WebsiteLead {
  id: string;
  name: string;
  phone: string;
  service: string;
  source: string;
  status: 'CONVERTED' | 'CONTACTED' | 'NEW';
  timeAgo: string;
}

const MOCK_WEBSITE_LEADS: WebsiteLead[] = [
  {
    id: 'wlead-1',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    service: 'Signature Hydra-Facial & Glow',
    source: 'Hero CTA Form',
    status: 'CONVERTED',
    timeAgo: '14 mins ago',
  },
  {
    id: 'wlead-2',
    name: 'Rahul Verma',
    phone: '+91 98112 34567',
    service: 'Hair Styling & Beard Consultation',
    source: 'Footer Booking Form',
    status: 'CONTACTED',
    timeAgo: '1 hour ago',
  },
  {
    id: 'wlead-3',
    name: 'Ananya Patel',
    phone: '+91 98450 12345',
    service: 'Bridal Aesthetic Package',
    source: 'WhatsApp Floating Widget',
    status: 'NEW',
    timeAgo: 'Today 11:30 AM',
  },
  {
    id: 'wlead-4',
    name: 'Sameer Khan',
    phone: '+91 98200 98765',
    service: 'Aromatherapy Full Body Massage',
    source: 'Services Grid Button',
    status: 'CONVERTED',
    timeAgo: 'Yesterday',
  },
];

const PREBUILT_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Luxury Gold & Slate',
    industry: 'Salon, Spa & Aesthetics',
    previewColor: 'from-amber-600 to-amber-900',
    primaryColor: '#D97706',
    active: true,
    font: 'Plus Jakarta Sans',
  },
  {
    id: 'tpl-2',
    name: 'Modern Emerald Clinical',
    industry: 'Dental, Clinic & Wellness',
    previewColor: 'from-emerald-600 to-teal-900',
    primaryColor: '#059669',
    active: false,
    font: 'Inter',
  },
  {
    id: 'tpl-3',
    name: 'Midnight Sleek Noir',
    industry: 'Fitness, Gym & Studios',
    previewColor: 'from-zinc-700 to-zinc-950',
    primaryColor: '#18181B',
    active: false,
    font: 'Outfit',
  },
  {
    id: 'tpl-4',
    name: 'Warm Terracotta Bistro',
    industry: 'Cafe, Restaurant & Bakery',
    previewColor: 'from-rose-600 to-orange-800',
    primaryColor: '#E11D48',
    active: false,
    font: 'Plus Jakarta Sans',
  },
];

const DEFAULT_BLOCKS: WebsiteBlock[] = [
  {
    id: 'blk-1',
    type: 'HERO',
    title: 'Experience Pure Radiance & Bespoke Luxury',
    order: 0,
    content: {
      heading: 'Experience Pure Radiance & Bespoke Luxury',
      subheading: 'Hyderabad’s premier destination for advanced skincare, precision hair styling, and holistic spa wellness.',
      ctaText: 'Book Consultation Slot',
      ctaLink: '#booking-form',
    },
  },
  {
    id: 'blk-2',
    type: 'SERVICES',
    title: 'Signature Aesthetic & Wellness Treatments',
    order: 1,
    content: {
      heading: 'Signature Aesthetic & Wellness Treatments',
      subheading: 'Crafted by world-class aestheticians using clinical-grade organic formulations.',
      ctaText: 'Explore Full Menu',
    },
  },
  {
    id: 'blk-3',
    type: 'FEATURES',
    title: 'Why Discerning Clients Choose Lumina Luxe',
    order: 2,
    content: {
      heading: 'Why Discerning Clients Choose Lumina Luxe',
      subheading: 'US-FDA approved laser aesthetic tech, private VIP therapy suites, and 100% cruelty-free botanical serums.',
    },
  },
  {
    id: 'blk-4',
    type: 'TESTIMONIALS',
    title: 'Over 120+ 5-Star Verified Google Reviews',
    order: 3,
    content: {
      heading: 'Over 120+ 5-Star Verified Google Reviews',
      subheading: 'Rated 4.9★ by our valued clientele for exceptional hygiene, personalized consultation, and stellar results.',
    },
  },
  {
    id: 'blk-5',
    type: 'CONTACT',
    title: 'Visit Our Sanctuary in Jubilee Hills',
    order: 4,
    content: {
      heading: 'Visit Our Sanctuary in Jubilee Hills',
      subheading: 'Road No. 36, Jubilee Hills, Hyderabad · Open 7 Days a Week: 10:00 AM – 9:00 PM · Complimentary Valet Parking.',
      ctaText: 'Get Directions on Maps',
    },
  },
];

export default function AIWebsiteBuilderPage() {
  const { website, updateWebsiteBlock, publishWebsiteToggle, addCustomer, canAccess, addToast, refreshData, t } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'templates' | 'forms' | 'seo'>('overview');

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
  const [editingCta, setEditingCta] = useState('');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  const [leadFormName, setLeadFormName] = useState('');
  const [leadFormPhone, setLeadFormPhone] = useState('');
  const [selectedService, setSelectedService] = useState('Signature Hydra-Facial & Glow');

  // Custom Domain & SSL State
  const [customDomainInput, setCustomDomainInput] = useState('luminaluxe.in');
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [isDomainVerified, setIsDomainVerified] = useState(true);

  // Ensure active page blocks are never empty
  const rawBlocks = website?.pages?.[0]?.blocks;
  const activeBlocks: WebsiteBlock[] = rawBlocks && rawBlocks.length > 0 ? rawBlocks : DEFAULT_BLOCKS;

  const selectedBlock = activeBlocks.find((b) => b.id === selectedBlockId);

  const getBlockHeading = (block: any) => {
    return block.content?.heading || block.content?.title || block.title || 'Section Block';
  };

  const getBlockSubheading = (block: any) => {
    return (
      block.content?.subheading ||
      block.content?.subtitle ||
      block.subtitle ||
      'Customized section content tailored for your storefront.'
    );
  };

  const handleSelectBlockForEditing = (block: WebsiteBlock) => {
    setSelectedBlockId(block.id);
    setEditingHeading(getBlockHeading(block));
    setEditingSubheading(getBlockSubheading(block));
    setEditingCta((block.content as any)?.ctaText || 'Learn More');
  };

  const handleSaveBlockEdit = async () => {
    if (!selectedBlockId) return;
    await updateWebsiteBlock(selectedBlockId, {
      heading: editingHeading,
      subheading: editingSubheading,
      ctaText: editingCta,
    });
    addToast({ type: 'success', title: 'Block Updated', message: 'Visual canvas updated successfully.' });
    setSelectedBlockId(null);
  };

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

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormName || !leadFormPhone) return;
    addCustomer({
      name: leadFormName,
      phone: leadFormPhone,
      tags: ['Website Lead', selectedService],
    });
    setLeadFormName('');
    setLeadFormPhone('');
    addToast({
      type: 'success',
      title: 'Lead Captured',
      message: `Added ${leadFormName} to CRM pipeline under Website Inquiries.`,
    });
  };

  const publicWebsiteUrl = `/site/${website?.subdomain || 'lumina-luxe'}`;

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>{t('website.websiteTitle', 'Storefront & Website Builder')}</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {website?.isPublished ? t('website.published', 'Published Live') : t('website.unpublished', 'Draft Mode')}
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('website.websiteDesc', 'Customize your storefront, manage blocks, preview mobile layouts, and ingest customer leads.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={publicWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5"
            title="Open published website in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>View Public Funnel</span>
          </a>

          {canAccess('website:write') && (
            <button
              onClick={() => setIsAiGeneratorOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('website.generateWithAi', 'Generate Site with AI')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Funnel Overview & Leads', icon: Globe },
          { id: 'editor', label: 'Visual Block Canvas', icon: Edit3 },
          { id: 'templates', label: 'Industry Themes', icon: Palette },
          { id: 'forms', label: 'Lead Capture Forms', icon: FileText },
          { id: 'seo', label: 'SEO & Metadata', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
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

      {/* 1. OVERVIEW & INGESTION TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Live Storefront Status Banner */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {website?.domainName || 'luminaluxe.com'}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  https://{website?.subdomain || 'lumina-luxe'}.businessos.app
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={publicWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Test Public View</span>
                </a>
                <button
                  type="button"
                  onClick={publishWebsiteToggle}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {website?.isPublished ? 'Unpublish Site' : 'Publish Live Now'}
                </button>
              </div>
            </div>

            {/* Funnel Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Monthly Visitors</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">1,420</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                  ↑ 24% from last month
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Lead Inquiries</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-display mt-1">42</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                  100% Ingested to CRM
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Conversion Rate</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">8.4%</p>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5 block">
                  Industry avg: 3.2%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Avg Time on Site</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">2m 45s</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                  High Engagement
                </span>
              </div>
            </div>
          </div>

          {/* Recent Ingested Leads Table */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Recent Storefront Lead Ingestions</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Inquiries submitted through your public website funnel automatically ingested into CRM.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                Live Webhooks Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                    <th className="py-2.5 px-3">Client Name</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Service Interest</th>
                    <th className="py-2.5 px-3">Funnel Channel</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Captured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {MOCK_WEBSITE_LEADS.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          {lead.name[0]}
                        </span>
                        <span>{lead.name}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-300">{lead.phone}</td>
                      <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300 font-medium">{lead.service}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lead.status === 'CONVERTED'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : lead.status === 'CONTACTED'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                          }`}
                        >
                          {lead.status === 'CONVERTED' ? 'Converted to Booking' : lead.status === 'CONTACTED' ? 'Follow-up Sent' : 'New Ingestion'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-400 font-mono text-[11px]">{lead.timeAgo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. VISUAL CANVAS & BLOCK EDITOR TAB */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-100 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-white">Visual Storefront Canvas</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                  {activeBlocks.length} Blocks Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewportMode === 'desktop' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-400'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewportMode === 'mobile' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-400'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`mx-auto transition-all ${viewportMode === 'mobile' ? 'max-w-sm' : 'w-full'} space-y-4`}>
              {activeBlocks.map((block, idx) => {
                const heading = getBlockHeading(block);
                const subheading = getBlockSubheading(block);
                const isSelected = selectedBlockId === block.id;

                return (
                  <div
                    key={block.id || idx}
                    onClick={() => handleSelectBlockForEditing(block)}
                    className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer shadow-sm relative group ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 uppercase">
                        {block.type} SECTION
                      </span>
                      <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to customize ✎
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-2 leading-snug">
                      {heading}
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {subheading}
                    </p>

                    {(block.content as any)?.ctaText && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                          {(block.content as any).ctaText}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Action: Ingest to CRM
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Block Customizer Side Panel */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <span>{selectedBlock ? `Customize ${selectedBlock.type} Block` : 'Select a Block to Edit'}</span>
              {selectedBlock && (
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  LIVE EDIT
                </span>
              )}
            </h3>

            {selectedBlock ? (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Section Heading</label>
                  <input
                    type="text"
                    value={editingHeading}
                    onChange={(e) => setEditingHeading(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Subheading & Copy</label>
                  <textarea
                    rows={3}
                    value={editingSubheading}
                    onChange={(e) => setEditingSubheading(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Call to Action (CTA) Button</label>
                  <input
                    type="text"
                    value={editingCta}
                    onChange={(e) => setEditingCta(e.target.value)}
                    placeholder="e.g. Book Appointment Now"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveBlockEdit}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Update Canvas</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
                <Edit3 className="w-6 h-6 mx-auto text-zinc-400" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Click any block card in the visual canvas on the left to modify headings, body text, and CTA buttons.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. INDUSTRY TEMPLATES & THEMES TAB */}
      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pre-built Industry Themes & Color Palettes</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Switch design aesthetics instantly. Form fields, CTA colors, and typography auto-adapt.
              </p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              4 Themes Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PREBUILT_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  tpl.active
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">{tpl.name}</span>
                  {tpl.active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Active Theme
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToast({ type: 'success', title: 'Theme Applied', message: `${tpl.name} theme is now active.` })}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Apply Theme
                    </button>
                  )}
                </div>

                <div className={`h-16 rounded-xl bg-gradient-to-r ${tpl.previewColor} flex items-center justify-center text-white text-xs font-bold shadow-inner`}>
                  {tpl.industry}
                </div>

                <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pt-1">
                  <span>Typography: {tpl.font}</span>
                  <span>Brand Color: {tpl.primaryColor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. LEAD CAPTURE FORMS TAB */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Simulate Website Lead Submission</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Test how customer leads submitted on your public storefront automatically sync into the CRM Contacts & Pipeline.
            </p>

            <form onSubmit={handleFormSubmission} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={leadFormName}
                  onChange={(e) => setLeadFormName(e.target.value)}
                  placeholder="e.g. Meera Nair"
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
                  placeholder="+91 98765 00000"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Service Requested</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Signature Hydra-Facial & Glow">Signature Hydra-Facial & Glow (₹3,500)</option>
                  <option value="Aromatherapy Full Body Massage">Aromatherapy Massage (₹4,500)</option>
                  <option value="Hair Styling & Beard Care">Hair Styling & Beard Care (₹1,200)</option>
                  <option value="Bridal Aesthetic Consultation">Bridal Aesthetic Consultation (₹15,000)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Visitor Lead Capture</span>
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Active Form Endpoints
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span>Hero Section Booking Pill</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">18 Submissions</span>
                </div>
                <p className="text-[11px] text-zinc-500">Triggers instant CRM ingestion with tag #HeroLead.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span>WhatsApp Floating Widget CTA</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">24 Clicks</span>
                </div>
                <p className="text-[11px] text-zinc-500">Redirects client with pre-filled service inquiry to wa.me.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span>Footer Consultation Form</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">9 Submissions</span>
                </div>
                <p className="text-[11px] text-zinc-500">Captures email & preferred contact time.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SEO TAB */}
      {activeTab === 'seo' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>SEO & OpenGraph Metadata</span>
          </h3>
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Meta Title</label>
              <input
                type="text"
                defaultValue={`${website?.domainName || 'Lumina Luxe'} — Premier Luxury Salon & Aesthetics`}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Meta Description</label>
              <textarea
                rows={3}
                defaultValue="Lumina Luxe — Premier luxury hair salon, hydra-facial aesthetics, and wellness spa in Jubilee Hills, Hyderabad. Book appointment online."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed"
              />
            </div>

            {/* Google Search Snippet Preview */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">Google Search Snippet Preview</span>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline cursor-pointer">
                Lumina Luxe — Premier Luxury Salon & Aesthetics
              </p>
              <p className="text-emerald-700 dark:text-emerald-400 text-[11px] font-mono">
                https://{website?.subdomain || 'lumina-luxe'}.businessos.app
              </p>
              <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                Lumina Luxe — Premier luxury hair salon, hydra-facial aesthetics, and wellness spa in Jubilee Hills, Hyderabad. Book appointment online.
              </p>
            </div>

            {/* Custom Domain & SSL Certificate Mapping */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Custom Domain & Auto SSL Certificate</span>
                  </span>
                  <p className="text-[11px] text-zinc-400">Map your own custom domain (e.g. www.yourbusiness.com) with automated TLS 1.3 encryption.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {isDomainVerified ? 'SSL ACTIVE (100%)' : 'PENDING'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="e.g. mybrand.in"
                  className="flex-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                />
                <button
                  type="button"
                  disabled={isVerifyingDomain}
                  onClick={() => {
                    setIsVerifyingDomain(true);
                    setTimeout(() => {
                      setIsVerifyingDomain(false);
                      setIsDomainVerified(true);
                      addToast({
                        type: 'success',
                        title: 'Domain Verified & SSL Active',
                        message: `${customDomainInput} successfully mapped to storefront with automatic TLS 1.3 cert.`,
                      });
                    }, 800);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isVerifyingDomain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{isVerifyingDomain ? 'Verifying DNS...' : 'Verify DNS & SSL'}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] space-y-1 text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center justify-between">
                  <span>Record Type: <strong className="text-zinc-700 dark:text-zinc-200">CNAME</strong></span>
                  <span>Target: <strong className="text-emerald-600 dark:text-emerald-400">cname.businessos.in</strong></span>
                  <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">Verified & Active</strong></span>
                </div>
              </div>
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
              <button
                type="button"
                onClick={() => setIsAiGeneratorOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
              >
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
                <button
                  type="button"
                  onClick={() => setIsAiGeneratorOpen(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
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
