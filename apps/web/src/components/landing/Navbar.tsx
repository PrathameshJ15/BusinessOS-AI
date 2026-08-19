'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Hindi Symbol */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            स
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">SAARTHI AI</span>
              <span className="text-xs text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 font-sans">
                सारथी AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wide">Business Operating System</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#ecosystem" className="hover:text-white transition-colors">Ecosystem</a>
          <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
          <a href="#industries" className="hover:text-white transition-colors">Industries</a>
          <a href="#intelligence" className="hover:text-white transition-colors">AI Architecture</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
          >
            <span>Launch Saarthi OS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
