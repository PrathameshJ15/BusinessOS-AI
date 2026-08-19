'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-6 bg-slate-950 text-white border-t border-slate-900 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
            स
          </div>
          <div>
            <span className="font-bold text-white">SAARTHI AI (सारथी AI)</span>
            <p className="text-[10px] text-slate-500">Ask. Saarthi does the work.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/dashboard/customers" className="hover:text-white transition-colors">Customers</Link>
          <Link href="/dashboard/website" className="hover:text-white transition-colors">Website</Link>
          <Link href="/dashboard/marketing" className="hover:text-white transition-colors">Marketing</Link>
          <Link href="/dashboard/ai" className="hover:text-white transition-colors">AI Workspace</Link>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>System All Operational</span>
        </div>
      </div>
    </footer>
  );
};
