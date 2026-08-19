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

  const [activeTab, setActiveTab] = useState<
    'overview' | 'campaigns' | 'whatsapp' | 'email' | 'social' | 'reviews' | 'aicontent'
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
  const [generatedAiOutput, setGeneratedAiOutput] = useState('');
  const [reviewReplyInputs, setReviewReplyInputs] = useState<{ [key: string]: string }>({});

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

  const handleGenerateSocialCopy = () => {
    if (!aiPromptTopic) return;
    setGeneratedAiOutput(
      `✨ ${aiPromptTopic.toUpperCase()} ✨\n\nExperience luxury wellness tailored just for you. Our expert therapists at Lumina Luxe Spa bring you rejuvenation like never before.\n\n👉 Book your appointment today via link in bio or WhatsApp us!\n\n#LuminaLuxe #SpaWellness #SelfCare #SalonLuxury #SaarthiAI`
    );
    addToast({ type: 'success', title: 'Social Content Drafted', message: 'Generated AI post copy.' });
  };

  const handlePostReviewReply = (reviewId: string) => {
    const text = reviewReplyInputs[reviewId] || 'Thank you for visiting Lumina Luxe Spa! We look forward to serving you again soon.';
    replyToReview(reviewId, text);
  };

  const totalDelivered = campaigns.reduce((acc, c) => acc + c.deliveredCount, 0);

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-white">Marketing & Growth Automation</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Deploy multi-channel broadcasts, AI copy generators, WhatsApp campaigns, and Google review management.</p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('marketing:write') ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
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
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Post Draft</span>
            </button>

            {generatedAiOutput && (
              <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{aiContentType} Post Output</span>
                <p className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-zinc-300">{generatedAiOutput}</p>
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
    </div>
  );
}
