'use client';

import React from 'react';
import Link from 'next/link';
import { SaarthiScene } from './3d/SaarthiScene';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-28 pb-16 px-6 bg-slate-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Editorial Copy */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Introducing Saarthi AI (सारथी AI)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-sans">
            Your business has a new <span className="text-blue-500 underline decoration-blue-500/30">Saarthi</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            One intelligent workspace that understands your business, takes action across your website, bookings, marketing, and customers, and helps you grow.
          </p>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-400 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>CORE OPERATING PHILOSOPHY</span>
            </div>
            <p className="text-sm font-bold text-white tracking-wide">"Ask. Saarthi does the work."</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <span>Experience Saarthi OS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#command"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-2xl transition-all text-center"
            >
              See Live Simulator
            </a>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Tenant RBAC
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" /> Provider Abstraction
            </span>
          </div>
        </div>

        {/* Right 3D Scene Viewport */}
        <div className="lg:col-span-6">
          <SaarthiScene />
        </div>
      </div>
    </section>
  );
};
