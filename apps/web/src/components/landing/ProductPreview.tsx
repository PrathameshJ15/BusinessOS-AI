'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Globe, Megaphone, Calendar, Sparkles, ExternalLink } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'website' | 'marketing' | 'ai'>('dashboard');

  const previews = {
    dashboard: {
      title: 'Business Command Center',
      metrics: 'Revenue: ₹84,000 | Today Appointments: 3 | Dormant Clients: 14',
      detail: 'Live Executive Pulse with 1-click Quick Action bar and actionable AI insight cards.',
    },
    customers: {
      title: 'Unified Customer Workspace',
      metrics: 'Active Records: 14 | Total Pipeline: ₹61,500 | LTV Leader: Ramesh Kumar (₹8,400)',
      detail: 'Visual CRM deal stage Kanban pipeline and multi-tab customer profile drawers.',
    },
    website: {
      title: 'AI Website Builder',
      metrics: 'Status: Live (https://lumina-luxe.businessos.app) | Monthly Visitors: 1,420',
      detail: 'Block-based page editor with instant desktop & mobile live canvas previews.',
    },
    marketing: {
      title: 'Marketing & Broadcasts',
      metrics: 'Delivered: 82 | Avg Open Rate: 78.4% | Reviews Synced: 3',
      detail: 'WhatsApp & SMS campaign creation wizard with AI social copywriter.',
    },
    ai: {
      title: 'AI Command Center',
      metrics: 'Active Model: OpenAI GPT-4o | RBAC Security: OWNER | Tools: 16 Registered',
      detail: '3-panel conversational interface with write confirmation cards & audit log.',
    },
  };

  const curr = previews[activeTab];

  return (
    <section className="py-20 px-6 bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Interactive SaaS Product Experience</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Real Small Businesses
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Click through the workspace modules below to preview Saarthi's live application interfaces.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'customers', label: 'Customers CRM', icon: Users },
            { id: 'website', label: 'Website Builder', icon: Globe },
            { id: 'marketing', label: 'Marketing', icon: Megaphone },
            { id: 'ai', label: 'AI Workspace', icon: Sparkles },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Simulated Screen View */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{curr.title}</h3>
              <p className="text-xs text-blue-400 font-mono mt-0.5">{curr.metrics}</p>
            </div>

            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Open Live Module</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </Link>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed font-sans">{curr.detail}</p>
            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              Role Permission Check: Passed (OWNER) • Multi-Tenant Isolation: Active
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
