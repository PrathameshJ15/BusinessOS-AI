'use client';

import React from 'react';
import { SidebarNav, HeaderNav } from '../../components/Navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNav />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
