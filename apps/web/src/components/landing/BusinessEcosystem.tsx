'use client';

import React from 'react';
import { Users, Globe, Megaphone, Calendar, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';

export const BusinessEcosystem: React.FC = () => {
  const modules = [
    {
      id: 'crm',
      title: 'Unified Customer CRM',
      desc: 'Centralized client profiles, lifetime value tracking, deal pipeline stages, and dormant account alerts.',
      accent: '#3B82F6', // Blue
      icon: Users,
      badge: 'Customer OS',
    },
    {
      id: 'website',
      title: 'AI Website Builder',
      desc: 'Structured JSON page generator with live block editor, responsive preview, lead forms, and custom domain setup.',
      accent: '#F59E0B', // Amber
      icon: Globe,
      badge: 'Website OS',
    },
    {
      id: 'marketing',
      title: 'Marketing & WhatsApp',
      desc: 'Multi-channel broadcasts, AI social copywriter, WhatsApp adapter sandbox, and Google review draft replies.',
      accent: '#8B5CF6', // Violet
      icon: Megaphone,
      badge: 'Marketing OS',
    },
    {
      id: 'bookings',
      title: 'Bookings & Billing',
      desc: 'Service calendar, staff slot management, automated reminders, and instant Razorpay sandbox invoices.',
      accent: '#10B981', // Emerald
      icon: Calendar,
      badge: 'Operations OS',
    },
  ];

  return (
    <section id="ecosystem" className="py-20 px-6 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Unified Module Network</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            One Core. Four Business Engines.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            No fragmented tools. Saarthi connects every dimension of your business into a single operational brain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: `${m.accent}20`, border: `1px solid ${m.accent}40` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: m.accent }} />
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${m.accent}15`, color: m.accent, border: `1px solid ${m.accent}30` }}
                    >
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">{m.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Isolated Tenant Data</span>
                  <span style={{ color: m.accent }}>Connected</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
