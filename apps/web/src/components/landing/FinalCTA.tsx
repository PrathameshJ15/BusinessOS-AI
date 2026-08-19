'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-slate-950 to-slate-900 text-white border-t border-slate-800 text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transform Your Business Today</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Your business has a new Saarthi.
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          One intelligent workspace that understands your business, takes action, and helps you grow.
        </p>

        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2"
          >
            <span>Launch Saarthi AI Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
