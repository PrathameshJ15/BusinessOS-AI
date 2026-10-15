'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Role } from '@businessos/shared';
import {
  LayoutDashboard,
  Users,
  Globe,
  Megaphone,
  Calendar,
  Sparkles,
  Settings,
  Building2,
  Bell,
  Search,
  Moon,
  Sun,
  UserCheck,
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const pathname = usePathname();
  const { session, setRole, switchAccount } = useApp();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Website', href: '/dashboard/website', icon: Globe },
    { name: 'Marketing', href: '/dashboard/marketing', icon: Megaphone },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'AI Workspace', href: '/dashboard/ai', icon: Sparkles, badge: 'AI Native' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-200 flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <Logo
          href="/dashboard"
          size={36}
          showText
          textVariant="dashboard"
          subtitle={session.organizationName}
          priority
        />
      </div>

      {/* Account & Role Switcher Widget */}
      <div className="mx-3 my-3 p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-400" />
            Account Context
          </span>
        </div>
        <select
          value={session.userEmail}
          onChange={(e) => switchAccount(e.target.value)}
          className="w-full text-[11px] font-semibold bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-lg p-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="prathamesh@test.com">Account A: Prathamesh</option>
          <option value="krushna@test.com">Account B: Krushna</option>
          <option value="admin@test.com">Account C: Admin</option>
          <option value="ananya@luminaluxe.com">Account D: Ananya Verma</option>
        </select>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 px-1">
          <span>Active Role</span>
          <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">{session.role}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          {(['OWNER', 'MANAGER', 'STAFF'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
                session.role === r
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {r === 'OWNER' ? 'Owner' : r === 'MANAGER' ? 'Mgr' : 'Staff'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-emerald-600/15 text-white shadow-sm border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0">
              {getInitials(session.userName)}
            </div>
            <div className="text-left leading-tight min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">{session.userName}</p>
              <p className="text-[10px] text-zinc-400 truncate">{session.userEmail}</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 shrink-0"></span>
        </div>
      </div>
    </aside>
  );
};

export const HeaderNav: React.FC = () => {
  const { session, theme, toggleTheme } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'x-saarthi-user-email': session.userEmail },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setNotifications(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session.userEmail]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ all: true }),
      });
    } catch {}
  };

  const handleMarkOneRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Quick Search & AI Prompt Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Ask Saarthi anything... (e.g. 'How is my business performing?')"
            className="w-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer font-sans font-medium"
            readOnly
            onClick={() => (window.location.href = '/dashboard/ai')}
          />
        </div>
      </div>

      {/* Right Action Icons, Dark Mode Switcher & Organization */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={toggleTheme}
          title="Toggle Dark Mode"
          aria-label="Toggle Theme Mode"
          className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
          <Building2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>{session.organizationName}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifs((prev) => !prev);
              if (!showNotifs) fetchNotifications();
            }}
            aria-label="Notifications"
            className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600"></span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-white">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-zinc-400 text-center py-4 text-xs">No notifications yet.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        n.isRead
                          ? 'bg-zinc-50/50 dark:bg-zinc-800/20 border-transparent text-zinc-400'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] truncate">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
