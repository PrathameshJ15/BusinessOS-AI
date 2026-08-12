'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Role } from '@businessos/shared';
import {
  LayoutDashboard,
  Users,
  Globe,
  Megaphone,
  Calendar,
  Sparkles,
  Settings,
  ShieldAlert,
  ChevronDown,
  Building2,
  Bell,
  Search,
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const pathname = usePathname();
  const { session, setRole } = useApp();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Website', href: '/dashboard/website', icon: Globe },
    { name: 'Marketing', href: '/dashboard/marketing', icon: Megaphone },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'AI Workspace', href: '/dashboard/ai', icon: Sparkles, badge: 'AI Native' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <h1 className="font-semibold text-base tracking-tight text-white flex items-center gap-1.5">
              BusinessOS <span className="text-xs bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.5 rounded border border-blue-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Lumina Luxe Spa</p>
          </div>
        </Link>
      </div>

      {/* Role Switcher Widget */}
      <div className="mx-3 my-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium px-1">
          <span>Active Role</span>
          <span className="font-mono text-[10px] text-blue-400 uppercase tracking-wider">{session.role}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['OWNER', 'MANAGER', 'STAFF'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`py-1 text-[11px] font-semibold rounded-md transition-all ${
                session.role === r
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {r === 'OWNER' ? 'Owner' : r === 'MANAGER' ? 'Mgr' : 'Staff'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-300">
              AV
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-slate-200">{session.userName}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{session.userEmail}</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
        </div>
      </div>
    </aside>
  );
};

export const HeaderNav: React.FC = () => {
  const { session } = useApp();

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Quick Search & AI Prompt Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Type a command or search... (e.g. 'Build my website', 'Inactive customers')"
            className="w-full bg-slate-100/80 hover:bg-slate-100 text-sm text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            readOnly
            onClick={() => (window.location.href = '/dashboard/ai')}
          />
        </div>
      </div>

      {/* Right Action Icons & Organization */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{session.organizationName}</span>
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
        </button>
      </div>
    </header>
  );
};
