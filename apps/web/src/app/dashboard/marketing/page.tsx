'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Campaign, Review } from '@businessos/shared';
import {
  Megaphone,
  Plus,
  Send,
  Sparkles,
  MessageSquare,
  Mail,
  CheckCircle2,
  Clock,
  TrendingUp,
  X,
  Users,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Star,
  Copy,
  Check,
  Bot,
  BarChart3,
  Calendar,
  Filter,
  Eye,
  FileText,
  AlertCircle,
  Smartphone,
  ExternalLink,
  Trash2,
  MousePointerClick,
  RefreshCw,
  Globe,
  PhoneCall,
  CalendarCheck,
} from 'lucide-react';

export default function MarketingWorkspacePage() {
  const { campaigns, reviews, customers, addCampaign, replyToReview, canAccess, addToast, t } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'campaigns' | 'smartlinks' | 'whatsapp' | 'email' | 'social' | 'reviews' | 'aicontent'
  >('overview');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [targetAudience, setTargetAudience] = useState<
    'ALL' | 'INACTIVE_30_DAYS' | 'VIP_CUSTOMERS' | 'NEW_LEADS'
  >('INACTIVE_30_DAYS');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [ctaText, setCtaText] = useState('Book Appointment');
  const [scheduleTime, setScheduleTime] = useState('IMMEDIATE');

  const [aiContentType, setAiContentType] = useState<'INSTAGRAM' | 'WHATSAPP' | 'GOOGLE_POST'>('INSTAGRAM');
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [isGeneratingSocialCopy, setIsGeneratingSocialCopy] = useState(false);
  const [generatedAiOutput, setGeneratedAiOutput] = useState('');
  const [reviewReplyInputs, setReviewReplyInputs] = useState<{ [key: string]: string }>({});

  // ─── Smart Business Links & Analytics State ──────────────────────────────
  const [smartLinks, setSmartLinks] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Smart Link form state
  const [linkName, setLinkName] = useState('');
  const [linkSlug, setLinkSlug] = useState('');
  const [destinationType, setDestinationType] = useState<
    'WHATSAPP' | 'BOOKING' | 'WEBSITE' | 'PHONE' | 'CUSTOM_URL'
  >('WHATSAPP');
  const [destinationValue, setDestinationValue] = useState('');
  const [linkCampaignId, setLinkCampaignId] = useState('');
  const [linkExpiresAt, setLinkExpiresAt] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Load Smart Links and Analytics
  const loadSmartLinksAndAnalytics = async () => {
    setIsLoadingLinks(true);
    try {
      const [linksRes, analyticsRes] = await Promise.all([
        fetch('/api/smart-links'),
        fetch('/api/analytics'),
      ]);
      if (linksRes.ok) {
        const data = await linksRes.json();
        setSmartLinks(data.links || []);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to load smart links and analytics:', err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    loadSmartLinksAndAnalytics();
  }, []);

  const handleCopySmartLink = (slug: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/go/${slug}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2500);
      addToast({
        type: 'success',
        title: 'Smart Link Copied',
        message: fullUrl,
      });
    }
  };

  const handleToggleSmartLink = async (linkId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/smart-links/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setSmartLinks((prev) =>
          prev.map((l) => (l.id === linkId ? { ...l, isActive: !currentStatus } : l))
        );
        addToast({
          type: 'info',
          title: 'Link Status Updated',
          message: !currentStatus ? 'Smart link enabled.' : 'Smart link paused.',
        });
        loadSmartLinksAndAnalytics();
      }
    } catch {
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not toggle smart link status.' });
    }
  };

  const handleDeleteSmartLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this smart link?')) return;
    try {
      const res = await fetch(`/api/smart-links/${linkId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSmartLinks((prev) => prev.filter((l) => l.id !== linkId));
        addToast({
          type: 'success',
          title: 'Smart Link Deleted',
          message: 'Link removed successfully.',
        });
        loadSmartLinksAndAnalytics();
      }
    } catch {
      addToast({ type: 'error', title: 'Delete Failed', message: 'Could not remove smart link.' });
    }
  };

  const handleCreateSmartLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkName.trim() || !linkSlug.trim() || !destinationValue.trim()) {
      addToast({ type: 'error', title: 'Missing Fields', message: 'Please complete all required fields.' });
      return;
    }

    setIsSubmittingLink(true);
    try {
      const res = await fetch('/api/smart-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: linkName.trim(),
          slug: linkSlug.trim(),
          destinationType,
          destinationValue: destinationValue.trim(),
          campaignId: linkCampaignId || null,
          expiresAt: linkExpiresAt || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create smart link.');
      }

      addToast({
        type: 'success',
        title: 'Smart Link Created',
        message: `/go/${data.link.slug} is now live and tracking clicks.`,
      });

      // Reset form
      setLinkName('');
      setLinkSlug('');
      setDestinationValue('');
      setLinkCampaignId('');
      setLinkExpiresAt('');
      setIsCreateLinkModalOpen(false);

      // Refresh links
      loadSmartLinksAndAnalytics();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message || 'Error creating smart link.',
      });
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleAiGenerateCampaign = (promptType: 'weekend' | 'diwali' | 'reactivation') => {
    if (promptType === 'weekend') {
      setName('Weekend Radiance 20% Off');
      setChannel('WHATSAPP');
      setTargetAudience('INACTIVE_30_DAYS');
      setSubject('Exclusive Weekend Spa Special');
      setContent('Hi {{name}}! We missed you at Lumina Luxe. Book your Hydra-Facial this weekend and get 20% off with promo code GLOW20. Reply YES to reserve!');
      setCtaText('Claim 20% Off');
    } else if (promptType === 'diwali') {
      setName('Diwali Festive Glow Package');
      setChannel('EMAIL');
      setTargetAudience('VIP_CUSTOMERS');
      setSubject(' ✨ Illuminate Your Beauty This Festive Season');
      setContent('Dear {{name}}, celebrate Diwali with our complimentary hot oil scalp treatment with every Aromatherapy Body Massage booked this month.');
      setCtaText('Book Festive Session');
    } else {
      setName('Re-engage Inactive Clients');
      setChannel('WHATSAPP');
      setTargetAudience('INACTIVE_30_DAYS');
      setSubject('We Miss You at Lumina Luxe!');
      setContent('Hi {{name}}, it has been over 60 days since your last visit! We saved a special ₹500 voucher for your next haircut or spa treatment.');
      setCtaText('Use ₹500 Voucher');
    }
    addToast({ type: 'info', title: 'AI Copy Generated', message: 'Structured campaign copy created.' });
  };

  const handleCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    addCampaign({
      name,
      channel,
      targetAudience,
      subject,
      content,
    });

    setName('');
    setContent('');
    setSubject('');
    setIsCreateModalOpen(false);
  };

  const handleGenerateSocialCopy = async () => {
    if (!aiPromptTopic.trim()) return;
    setIsGeneratingSocialCopy(true);
    setGeneratedAiOutput('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Write a high-converting, polished social media marketing post for platform: ${aiContentType}. Topic or promotion: "${aiPromptTopic.trim()}". Include an eye-catching opening hook, key customer benefits, urgency, a direct call to action with booking details, and 5-8 relevant hashtags.`,
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.type === 'content' && parsed.content) {
                  accumulated += parsed.content;
                  setGeneratedAiOutput(accumulated);
                }
              } catch {}
            }
          }
        }
        addToast({ type: 'success', title: 'Social Content Drafted', message: 'Generated AI post copy with Saarthi AI.' });
      } else {
        throw new Error('AI generation stream failed');
      }
    } catch {
      setGeneratedAiOutput(
        `✨ ${aiPromptTopic.toUpperCase()} ✨\n\nExperience luxury wellness tailored just for you. Our expert therapists bring you rejuvenation like never before.\n\n👉 Book your appointment today via link in bio or WhatsApp us!\n\n#BusinessWellness #SelfCare #LuxuryService #SaarthiAI`
      );
      addToast({ type: 'success', title: 'Social Content Drafted', message: 'Generated post copy (fallback template).' });
    } finally {
      setIsGeneratingSocialCopy(false);
    }
  };

  const handlePostReviewReply = async (reviewId: string) => {
    const text = reviewReplyInputs[reviewId] || 'Thank you for visiting! We look forward to serving you again soon.';
    await replyToReview(reviewId, text);
    setReviewReplyInputs((prev) => ({ ...prev, [reviewId]: '' }));
  };

  const totalDelivered = campaigns.reduce((acc, c) => acc + c.deliveredCount, 0);

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-white">
            {t('marketing.marketingTitle', 'Marketing & Growth Automation')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('marketing.marketingDesc', 'Deploy multi-channel broadcasts, AI copy generators, WhatsApp campaigns, and Google review management.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('marketing:write') ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('marketing.createCampaignBtn', 'Create Campaign')}</span>
            </button>
          ) : (
            <span className="text-xs text-zinc-400 font-mono px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              Role: Restricted (Read Only)
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Performance Overview', icon: BarChart3 },
          { id: 'campaigns', label: 'Campaign Broadcasts', icon: Megaphone },
          { id: 'smartlinks', label: 'Smart Links & Analytics', icon: Smartphone },
          { id: 'social', label: 'AI Social Post Drafts', icon: Share2 },
          { id: 'reviews', label: 'Google Business Reviews', icon: Star },
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-mono">Total Messages Broadcast</span>
              <p className="text-2xl font-display font-bold text-zinc-900 dark:text-white">{totalDelivered} Delivered</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">100% WhatsApp Delivery Rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-mono">Campaign Conversion</span>
              <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 font-display">64% Open & Click Rate</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">Industry benchmark: 45%</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-mono">Reputation Score</span>
              <p className="text-2xl font-display font-bold text-amber-500 font-display">4.9 ★ Rating</p>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">{reviews.length} Verified Reviews</span>
            </div>
          </div>

          <div className="bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Content Co-Pilot Active</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Generate social media posts, WhatsApp offer copy, and automated review responses with pre-trained Indian business templates.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('social')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 shrink-0"
            >
              <span>Draft AI Social Post</span>
            </button>
          </div>
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Active & Past Broadcast Campaigns</h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">{campaigns.length} Total Campaigns</span>
          </div>

          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      {c.channel.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{c.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">Target: {c.targetAudience.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 italic p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  "{c.content}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700 font-mono">
                  <span>Recipients: {c.totalRecipients}</span>
                  <span>Delivered: {c.deliveredCount}</span>
                  <span>Opened: {c.openedCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMART LINKS & ANALYTICS TAB */}
      {activeTab === 'smartlinks' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-mono tracking-wider">Total Link Clicks</span>
                <MousePointerClick className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-display font-bold text-zinc-900 dark:text-white">
                {analyticsData?.summary?.totalClicksAcrossLinks ?? smartLinks.reduce((acc, l) => acc + (l.totalClicks || 0), 0)}
              </p>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Across all active & past smart links</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-mono tracking-wider">WhatsApp Clicks</span>
                <Smartphone className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                {analyticsData?.summary?.whatsappClicks ?? 0}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">Direct high-intent customer chats</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-mono tracking-wider">Booking Conversions</span>
                <CalendarCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-display font-bold text-indigo-600 dark:text-indigo-400">
                {analyticsData?.summary?.bookingClicks ?? 0}
              </p>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Visits directed to booking page</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-mono tracking-wider">Active Links</span>
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-display font-bold text-zinc-900 dark:text-white">
                {smartLinks.filter((l) => l.isActive).length} / {smartLinks.length}
              </p>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Routing visitors with 307 redirects</span>
            </div>
          </div>

          {/* Links Management Section */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Configured Smart Business Links</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Distribute branded shortlinks on Instagram, WhatsApp, flyers, and SMS with automated click analytics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadSmartLinksAndAnalytics}
                  disabled={isLoadingLinks}
                  className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all"
                  title="Refresh links"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLinks ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateLinkModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Smart Link</span>
                </button>
              </div>
            </div>

            {smartLinks.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No smart links created yet</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Create your first smart link to redirect customers to your WhatsApp chat, online booking, or custom promotion.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateLinkModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Your First Link</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {smartLinks.map((link) => {
                  const isCopied = copiedLinkId === link.id;
                  const destinationBadge =
                    link.destinationType === 'WHATSAPP' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                    : link.destinationType === 'BOOKING' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800'
                    : link.destinationType === 'PHONE' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                    : link.destinationType === 'WEBSITE' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800'
                    : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800';

                  return (
                    <div
                      key={link.id}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {link.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${destinationBadge}`}>
                            {link.destinationType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              link.isActive
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                            }`}
                          >
                            {link.isActive ? 'Active' : 'Paused'}
                          </span>
                          {link.campaign?.name && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              Campaign: {link.campaign.name}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            /go/{link.slug}
                          </span>
                          <span className="text-zinc-400">→</span>
                          <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-xs md:max-w-md">
                            {link.destinationValue}
                          </span>
                        </div>

                        {link.expiresAt && (
                          <p className="text-[10px] text-zinc-400">
                            Expires: {new Date(link.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-center mr-1">
                          <span className="text-[10px] text-zinc-400 block font-mono">CLICKS</span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                            {link.totalClicks || 0}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopySmartLink(link.slug, link.id)}
                          className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Copy Link"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[11px]">{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <a
                          href={`/go/${link.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg transition-all"
                          title="Test Redirect"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleToggleSmartLink(link.id, link.isActive)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            link.isActive
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {link.isActive ? 'Pause' : 'Resume'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSmartLink(link.id)}
                          className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                          title="Delete Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Redirect Telemetry Card */}
          {analyticsData?.recentEvents && analyticsData.recentEvents.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real-time Event Stream</span>
                </h4>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {analyticsData.recentEvents.length} Recent Clicks Logged
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {analyticsData.recentEvents.slice(0, 8).map((ev: any) => (
                  <div key={ev.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{ev.eventType.replace(/_/g, ' ')}</span>
                      {ev.linkSlug && (
                        <span className="font-mono text-zinc-400 text-[11px]">(/go/{ev.linkSlug})</span>
                      )}
                      {ev.campaignName && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          {ev.campaignName}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SOCIAL MEDIA AI GENERATOR TAB */}
      {activeTab === 'social' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-2xl space-y-6">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>AI Social Post & Caption Generator</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Craft high-converting social copy with hashtags tailored to salon, clinic, and local service offerings.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Target Social Platform</label>
              <div className="flex gap-2">
                {(['INSTAGRAM', 'WHATSAPP', 'GOOGLE_POST'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setAiContentType(plat)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
                      aiContentType === plat ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Campaign Offer or Promotion Topic</label>
              <input
                type="text"
                value={aiPromptTopic}
                onChange={(e) => setAiPromptTopic(e.target.value)}
                placeholder="e.g. Monsoon Hair Spa Offer 25% Off"
                className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              onClick={handleGenerateSocialCopy}
              disabled={isGeneratingSocialCopy || !aiPromptTopic.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Post Draft</span>
            </button>

            {generatedAiOutput && (
              <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{aiContentType} Post Output</span>
                <p className="text-xs whitespace-pre-wrap font-multilingual leading-[1.65] text-zinc-300">{generatedAiOutput}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Google Business Reviews ({reviews.length})</h3>
            <span className="text-xs text-amber-500 font-bold">4.9 ★ Rating</span>
          </div>

          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-white">{r.authorName}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300">"{r.content}"</p>

                {r.responseText ? (
                  <div className="p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Published Response: </span>"{r.responseText}"
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Write response or use AI..."
                      value={reviewReplyInputs[r.id] || ''}
                      onChange={(e) => setReviewReplyInputs({ ...reviewReplyInputs, [r.id]: e.target.value })}
                      className="flex-1 text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                    <button
                      onClick={() => handlePostReviewReply(r.id)}
                      className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500"
                    >
                      Post Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Create Broadcast Campaign</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCampaignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. Weekend Flash Offer"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">AI Prompt Templates</label>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => handleAiGenerateCampaign('weekend')} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[10px] font-bold">
                    Weekend Special
                  </button>
                  <button type="button" onClick={() => handleAiGenerateCampaign('reactivation')} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[10px] font-bold">
                    Inactive Client Offer
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="Enter message text..."
                />
              </div>

              {smartLinks.length > 0 && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Insert Smart Link</label>
                  <div className="flex flex-wrap gap-1.5">
                    {smartLinks.slice(0, 4).map((sl) => (
                      <button
                        key={sl.id}
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== 'undefined' ? window.location.origin : '';
                          const linkUrl = `${origin}/go/${sl.slug}`;
                          setContent((prev) => (prev ? `${prev} ${linkUrl}` : linkUrl));
                          addToast({ type: 'info', title: 'Link Attached', message: `Inserted /go/${sl.slug}` });
                        }}
                        className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-md text-[10px] font-mono hover:border-emerald-500 transition-all"
                      >
                        +{sl.name} (/go/{sl.slug})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SMART LINK MODAL */}
      {isCreateLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Create Smart Business Link</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateLinkModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSmartLinkSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Link Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkName}
                  onChange={(e) => {
                    setLinkName(e.target.value);
                    if (!linkSlug) {
                      setLinkSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')
                          .replace(/-+/g, '-')
                          .slice(0, 30)
                      );
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g. VIP WhatsApp Consultation"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Unique Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
                  <span className="px-3 py-2.5 text-zinc-400 font-mono text-xs border-r border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60">
                    /go/
                  </span>
                  <input
                    type="text"
                    required
                    value={linkSlug}
                    onChange={(e) =>
                      setLinkSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    className="flex-1 p-2.5 bg-transparent text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none"
                    placeholder="vip-whatsapp"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Lowercase letters, numbers, and hyphens only.</p>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Destination Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={destinationType}
                  onChange={(e) => {
                    const nextType = e.target.value as any;
                    setDestinationType(nextType);
                    if (nextType === 'BOOKING' && !destinationValue) setDestinationValue('/site/lumina-luxe#book');
                    if (nextType === 'WEBSITE' && !destinationValue) setDestinationValue('/site/lumina-luxe');
                  }}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="WHATSAPP">WhatsApp Click-to-Chat</option>
                  <option value="BOOKING">Booking Page</option>
                  <option value="WEBSITE">Website Page</option>
                  <option value="PHONE">Phone Call (tel:)</option>
                  <option value="CUSTOM_URL">Custom URL (http/https)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Destination Target <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={destinationValue}
                  onChange={(e) => setDestinationValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs"
                  placeholder={
                    destinationType === 'WHATSAPP'
                      ? 'e.g. 919876543210'
                      : destinationType === 'PHONE'
                      ? 'e.g. +91 98765 43210'
                      : destinationType === 'BOOKING'
                      ? 'e.g. /site/lumina-luxe#book or /dashboard/bookings'
                      : destinationType === 'WEBSITE'
                      ? 'e.g. /site/lumina-luxe'
                      : 'e.g. https://instagram.com/mybusiness'
                  }
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Associate Campaign (Optional)
                </label>
                <select
                  value={linkCampaignId}
                  onChange={(e) => setLinkCampaignId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">No Campaign Association</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.channel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={linkExpiresAt}
                  onChange={(e) => setLinkExpiresAt(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateLinkModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLink}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmittingLink ? 'Creating...' : 'Create Smart Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
