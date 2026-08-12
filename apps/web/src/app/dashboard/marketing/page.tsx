'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
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
} from 'lucide-react';

export default function MarketingPage() {
  const { campaigns, addCampaign, canAccess, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Campaign Form State
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [targetAudience, setTargetAudience] = useState<'INACTIVE_30_DAYS' | 'VIP_CUSTOMERS' | 'NEW_LEADS'>('INACTIVE_30_DAYS');
  const [content, setContent] = useState('');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) {
      addToast({ type: 'error', title: 'Form Incomplete', message: 'Campaign name and content are required.' });
      return;
    }

    addCampaign({
      name,
      channel,
      targetAudience,
      content,
    });

    setIsModalOpen(false);
    setName('');
    setContent('');
  };

  const generateAICopy = () => {
    setContent(
      `Hi {{name}}! We missed you at Lumina Luxe. Book your spa treatment this weekend and enjoy an exclusive 20% off with promo code GLOW20. Reply YES to reserve!`
    );
    addToast({ type: 'info', title: 'AI Copy Generated', message: 'Drafted high-converting offer copy.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketing & Broadcast Automation</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-channel WhatsApp, SMS, and Email promotional campaigns with AI copywriting.</p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('marketing:write') ? (
            <button
              onClick={() => setIsModalOpen(true)}
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

      {/* Campaigns Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-xs text-slate-500 font-medium uppercase">Active Broadcasts</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{campaigns.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> 84% avg open rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-xs text-slate-500 font-medium uppercase">Total Delivered</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {campaigns.reduce((acc, c) => acc + c.deliveredCount, 0)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">WhatsApp & SMS Channels</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-xs text-slate-500 font-medium uppercase">Total Clicks / Conversions</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {campaigns.reduce((acc, c) => acc + c.clickedCount, 0)}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">₹18,400 revenue attributed</span>
        </div>
      </div>

      {/* Campaign List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Campaigns</h3>
          <span className="text-xs text-slate-500">{campaigns.length} Campaigns</span>
        </div>

        <div className="divide-y divide-slate-100">
          {campaigns.map((cmp) => (
            <div key={cmp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  {cmp.channel === 'WHATSAPP' ? (
                    <MessageSquare className="w-5 h-5" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
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

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create Marketing Campaign</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Special Hydra-Facial Promo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Broadcast Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="WHATSAPP">WhatsApp Business</option>
                    <option value="SMS">SMS Direct</option>
                    <option value="EMAIL">Email Newsletter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Segment</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="INACTIVE_30_DAYS">Inactive Clients (30+ Days)</option>
                    <option value="VIP_CUSTOMERS">VIP Regulars</option>
                    <option value="NEW_LEADS">New Leads</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Message Copy</label>
                  <button
                    type="button"
                    onClick={generateAICopy}
                    className="text-[11px] text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate AI Copy
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Enter message copy or click Auto-Generate..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow flex items-center gap-1.5"
                >
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
