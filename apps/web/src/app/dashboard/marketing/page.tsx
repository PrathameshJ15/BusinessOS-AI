'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function MarketingWorkspacePage() {
  const { campaigns, reviews, customers, addCampaign, replyToReview, canAccess, addToast } = useApp();

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'campaigns' | 'whatsapp' | 'email' | 'social' | 'reviews' | 'aicontent'
  >('overview');

  // Create Campaign Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [targetAudience, setTargetAudience] = useState<
    'INACTIVE_30_DAYS' | 'VIP_CUSTOMERS' | 'NEW_LEADS' | 'NOT_BOOKED_RECENTLY'
  >('INACTIVE_30_DAYS');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [ctaText, setCtaText] = useState('Book Appointment');
  const [scheduleTime, setScheduleTime] = useState('IMMEDIATE');

  // AI Prompt Helper inside modal
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
      setTargetAudience('NOT_BOOKED_RECENTLY');
      setSubject('We Miss You at Lumina Luxe!');
      setContent('Hi {{name}}, it has been over 60 days since your last visit! We saved a special ₹500 voucher for your next haircut or spa treatment.');
      setCtaText('Use ₹500 Voucher');
    }
    addToast({ type: 'info', title: 'AI Copy Generated', message: 'Structured campaign copy created.' });
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    addCampaign({
      name,
      channel,
      targetAudience: targetAudience as any,
      subject,
      content,
    });

    setIsCreateModalOpen(false);
    setName('');
    setContent('');
    setSubject('');
  };

  // Social Post Generator State
  const [socialPlatform, setSocialPlatform] = useState<'instagram' | 'facebook' | 'linkedin'>('instagram');
  const [socialTopic, setSocialTopic] = useState('Hydra-Facial Glow Benefits');
  const [socialPostOutput, setSocialPostOutput] = useState(
    ' ✨ Discover the secret to luminous skin! Our Signature Hydra-Facial deeply cleanses, hydrates, and restores natural radiance. Book your session today at Lumina Luxe Spa. #HydraFacial #Skincare #HyderabadSpa #LuminaLuxe'
  );
  const [copiedSocial, setCopiedSocial] = useState(false);

  const handleGenerateSocialPost = () => {
    if (socialPlatform === 'instagram') {
      setSocialPostOutput(
        ` ✨ Elevate your weekend wellness with ${socialTopic}! Tag a friend who needs a spa day below 👇 Book via link in bio! #SelfCare #SpaDay #${socialTopic.replace(/\s+/g, '')}`
      );
    } else if (socialPlatform === 'facebook') {
      setSocialPostOutput(
        ` 🌸 Weekend Special Announcement: Experience ${socialTopic} at Lumina Luxe. Enjoy complimentary botanical tea and relaxation therapies with every booking. Click below to reserve your slot!`
      );
    } else {
      setSocialPostOutput(
        `Executives and professionals: Prioritizing wellness is key to peak performance. Our ${socialTopic} is designed for deep rejuvenation. Learn more about our business corporate packages.`
      );
    }
    addToast({ type: 'info', title: 'Social Post Created', message: `Drafted ${socialPlatform.toUpperCase()} post copy.` });
  };

  // Reviews AI Reply Draft State
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, string>>({});

  const handleDraftReviewReply = (rev: Review) => {
    const draftText = rev.aiSuggestedResponse || `Thank you so much ${rev.authorName} for your wonderful ${rev.rating}-star review! We look forward to welcoming you back to Lumina Luxe soon.`;
    setReviewDrafts((prev) => ({ ...prev, [rev.id]: draftText }));
  };

  const handleApproveReviewReply = (reviewId: string) => {
    const draftText = reviewDrafts[reviewId];
    if (!draftText) return;
    replyToReview(reviewId, draftText);
    setReviewDrafts((prev) => {
      const copy = { ...prev };
      delete copy[reviewId];
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketing & Broadcast Automation</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-channel campaigns, WhatsApp adapters, AI social copywriter, and Google reviews manager.</p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('marketing:write') ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-mono px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
              Role: Restricted (Read Only)
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-wrap gap-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'campaigns', label: `Campaigns (${campaigns.length})` },
          { id: 'whatsapp', label: 'WhatsApp Adapter' },
          { id: 'email', label: 'Email Broadcasts' },
          { id: 'social', label: 'AI Social Post' },
          { id: 'reviews', label: `Reviews (${reviews.length})` },
          { id: 'aicontent', label: 'AI Copy Playground' },
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

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-medium text-slate-500 uppercase">Total Campaigns</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{campaigns.length}</p>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +2 new this month
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-medium text-slate-500 uppercase">Messages Delivered</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {campaigns.reduce((acc, c) => acc + c.deliveredCount, 0)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">WhatsApp & SMS Channels</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-medium text-slate-500 uppercase">Avg Open Rate</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">78.4%</p>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Industry benchmark: 45%</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-medium text-slate-500 uppercase">Attributed Revenue</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹18,400</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">19 booking conversions</span>
            </div>
          </div>

          {/* AI Recommendation Insight */}
          <div className="bg-slate-900 p-6 rounded-3xl text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Re-engage 14 Inactive Clients This Weekend</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Sending an automated WhatsApp flash offer to clients who haven't visited in 30+ days is projected to generate ₹12,500 in additional sales.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
            >
              <span>Broadcast Offer Campaign</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Campaign History & Scheduled Broadcasts</h3>
            <span className="text-xs text-slate-500">{campaigns.length} Campaigns</span>
          </div>

          <div className="divide-y divide-slate-100">
            {campaigns.map((cmp) => (
              <div key={cmp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    {cmp.channel === 'WHATSAPP' ? <MessageSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{cmp.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {cmp.channel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-md line-clamp-1">"{cmp.content}"</p>
                    <p className="text-[10px] text-slate-400 mt-1">Target: {cmp.targetAudience.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-600">
                  <div className="text-center">
                    <span className="font-bold text-slate-900 block">{cmp.totalRecipients}</span>
                    <span className="text-[10px] text-slate-400">Recipients</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-slate-900 block">{cmp.openedCount}</span>
                    <span className="text-[10px] text-slate-400">Opened</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-emerald-600 block">{cmp.clickedCount}</span>
                    <span className="text-[10px] text-slate-400">Clicks</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {cmp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WHATSAPP TAB */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle max-w-3xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Business Service Adapter</h3>
              <p className="text-xs text-slate-500">Isolated messaging service interface running in simulation sandbox mode.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              Adapter Connected (Sandbox)
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-900">Business Account ID: waba-7788</span>
            <p className="text-slate-600">Phone Number: +91 98765 43210</p>
            <p className="text-[11px] text-slate-400 font-mono">
              Note: Messages are processed via the clean `IWhatsAppService` adapter interface. No un-verified external API calls are claimed.
            </p>
          </div>
        </div>
      )}

      {/* EMAIL TAB */}
      {activeTab === 'email' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Email Campaign Broadcast Editor</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line</label>
              <input
                type="text"
                placeholder="e.g. ✨ Your Exclusive August Spa Perks Inside"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preview Text</label>
              <input
                type="text"
                placeholder="Complimentary hot oil scalp treatment with every booking"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <button onClick={() => addToast({ type: 'success', title: 'Email Queued', message: 'Email broadcast queued for delivery.' })} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
              Queue Email Broadcast
            </button>
          </div>
        </div>
      )}

      {/* SOCIAL TAB */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">AI Social Post Generator</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'instagram', label: 'Instagram', icon: Instagram },
                    { id: 'facebook', label: 'Facebook', icon: Facebook },
                    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSocialPlatform(p.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          socialPlatform === p.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Post Topic / Feature</label>
                <input
                  type="text"
                  value={socialTopic}
                  onChange={(e) => setSocialTopic(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <button
                onClick={handleGenerateSocialPost}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Post Copy with AI</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{socialPlatform} Post Output</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(socialPostOutput);
                    setCopiedSocial(true);
                    setTimeout(() => setCopiedSocial(false), 2000);
                    addToast({ type: 'info', title: 'Copied to Clipboard', message: 'Ready to paste on social platform.' });
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  {copiedSocial ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSocial ? 'Copied!' : 'Copy Copy'}</span>
                </button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                {socialPostOutput}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono">Generated via Unified AI Service Layer</div>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Google Business Reviews Management</h3>
            <span className="text-xs text-slate-500">{reviews.length} Reviews Synchronized</span>
          </div>

          <div className="space-y-4">
            {reviews.map((r) => {
              const draftReply = reviewDrafts[r.id];
              return (
                <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{r.authorName}</span>
                      <div className="flex items-center text-amber-500 text-xs">
                        {'★'.repeat(r.rating)}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{r.platform}</span>
                  </div>

                  <p className="text-xs text-slate-700">"{r.content}"</p>

                  {/* Active Response vs Draft AI Review Reply */}
                  {r.responseText ? (
                    <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-100 text-xs text-blue-900">
                      <span className="font-bold text-blue-700">Published Response: </span>"{r.responseText}"
                    </div>
                  ) : draftReply ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        AI Response Draft (Review Before Posting)
                      </span>
                      <textarea
                        rows={2}
                        value={draftReply}
                        onChange={(e) => setReviewDrafts({ ...reviewDrafts, [r.id]: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveReviewReply(r.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
                        >
                          Approve & Publish Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDraftReviewReply(r)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Draft AI Reply</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI COPY PLAYGROUND TAB */}
      {activeTab === 'aicontent' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">AI Copywriting Generator</h3>
          <p className="text-xs text-slate-500">Generate promotional email headlines, SMS offers, and push messages.</p>
          <div className="space-y-3">
            <button
              onClick={() => handleAiGenerateCampaign('weekend')}
              className="w-full p-3 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between"
            >
              <span>Generate Weekend Offer Campaign Copy</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => handleAiGenerateCampaign('diwali')}
              className="w-full p-3 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between"
            >
              <span>Generate Diwali Festive Promotion</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Marketing Campaign</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Shortcut Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI Templates:</span>
              <button
                type="button"
                onClick={() => handleAiGenerateCampaign('weekend')}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold whitespace-nowrap"
              >
                Weekend Offer
              </button>
              <button
                type="button"
                onClick={() => handleAiGenerateCampaign('diwali')}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold whitespace-nowrap"
              >
                Diwali Promo
              </button>
              <button
                type="button"
                onClick={() => handleAiGenerateCampaign('reactivation')}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-bold whitespace-nowrap"
              >
                Reactivation
              </button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Flash Sale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="WHATSAPP">WhatsApp Business</option>
                    <option value="SMS">Direct SMS</option>
                    <option value="EMAIL">Email Broadcast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Segment</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="INACTIVE_30_DAYS">Inactive Clients (30+ Days)</option>
                    <option value="VIP_CUSTOMERS">VIP High Value</option>
                    <option value="NEW_LEADS">New Leads</option>
                    <option value="NOT_BOOKED_RECENTLY">Not Booked Recently</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
