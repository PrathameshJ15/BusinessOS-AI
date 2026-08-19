'use client';

import React from 'react';
import { Layers, Bot, Zap, Globe, FileText, Check } from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    'Multi-tenant Neon PostgreSQL Database Architecture',
    'OpenAI, Anthropic, Gemini, Groq Multi-Provider Abstraction',
    'Role-Based Access Control Guard (Owner, Manager, Staff)',
    'Visual CRM Deal Pipeline (New, Contacted, Proposal, Won, Lost)',
    'Block-Based AI Website Generator with Desktop/Mobile Live Canvas',
    'WhatsApp Business Sandbox Adapter with Delivery Tracing',
    'Google Business Review Manager with AI Draft Responses',
    'Razorpay Sandbox Billing & Invoicing Simulation Engine',
    'Full Dark Mode & Light Mode UI Theme Switching',
    'Audit Security Logging for Every AI Action Executed',
  ];

  return (
    <section id="features" className="py-20 px-6 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Complete Feature Matrix</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Production-Ready Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Everything built into the Saarthi AI monorepo architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {featureList.map((feat, idx) => (
            <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3 text-xs text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
