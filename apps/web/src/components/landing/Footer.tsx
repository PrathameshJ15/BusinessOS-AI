'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="py-16 px-6 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">स</div>
              <div>
                <span className="font-display font-bold text-sm text-zinc-900 dark:text-white">Saarthi AI</span>
                <span className="text-xs font-devanagari text-zinc-500 dark:text-zinc-400 block">सारथी AI</span>
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[240px]">One intelligent workspace that understands your business, takes action, and helps you grow.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Product</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#services" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Services</a>
              <a href="#how-it-works" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">How It Works</a>
              <a href="#product" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Product Preview</a>
              <a href="#results" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Results</a>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Platform</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/dashboard" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Dashboard</Link>
              <Link href="/dashboard/customers" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Customer CRM</Link>
              <Link href="/dashboard/marketing" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Marketing</Link>
              <Link href="/dashboard/ai" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">AI Workspace</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Company</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#case-studies" className="text-xs text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Case Studies</a>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">About</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Contact</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Privacy Policy</span>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">© {new Date().getFullYear()} Saarthi AI. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
