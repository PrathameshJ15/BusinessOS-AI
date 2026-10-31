'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
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
  Menu,
  X,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const SidebarContent: React.FC<{ isMobile?: boolean; onClose?: () => void }> = ({ isMobile, onClose }) => {
  const pathname = usePathname();
  const { session, setRole, switchAccount, t } = useApp();

  const navItems = [
    { name: t('nav.dashboard', 'Dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.customers', 'Customers'), href: '/dashboard/customers', icon: Users },
    { name: t('nav.website', 'Website'), href: '/dashboard/website', icon: Globe },
    { name: t('nav.marketing', 'Marketing'), href: '/dashboard/marketing', icon: Megaphone },
    { name: t('nav.bookings', 'Bookings'), href: '/dashboard/bookings', icon: Calendar },
    { name: t('nav.aiWorkspace', 'AI Workspace'), href: '/dashboard/ai', icon: Sparkles, badge: t('common.aiNative', 'AI Native') },
    { name: t('nav.settings', 'Settings'), href: '/dashboard/settings', icon: Settings },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      document.cookie = 'saarthi_user_email=; path=/; max-age=0; SameSite=Lax';
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
        <Logo
          href="/dashboard"
          size={34}
          showText
          textVariant="dashboard"
          subtitle={session.organizationName}
          priority
        />
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Account & Role Switcher Widget */}
      <div className="mx-3 my-3 p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-400" />
            {t('nav.accountContext', 'Account Context')}
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
          <span>{t('nav.activeRole', 'Active Role')}</span>
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
              {r === 'OWNER' ? t('nav.owner', 'Owner') : r === 'MANAGER' ? t('nav.manager', 'Mgr') : t('nav.staff', 'Staff')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          {t('nav.platformNav', 'Platform Navigation')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
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
      <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] border-t border-zinc-800 bg-zinc-950/40 mt-auto">
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
          <button
            type="button"
            onClick={handleLogout}
            title={t('nav.signOut', 'Sign Out')}
            aria-label="Sign out"
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const SidebarNav: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-200 flex-col h-screen sticky top-0 z-40 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
            onClick={onCloseMobile}
          />
          {/* Drawer Sidebar */}
          <aside className="relative z-10 w-72 max-w-[85vw] bg-zinc-900 border-r border-zinc-800 text-zinc-200 flex flex-col h-full shadow-2xl select-none animate-in slide-in-from-left duration-200">
            <SidebarContent isMobile onClose={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
};

export interface HeaderNavProps {
  onOpenMobileNav?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenMobileNav }) => {
  const { session, theme, toggleTheme, t } = useApp();
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
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between gap-2">
      {/* Left: Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Quick Search & AI Prompt Bar */}
        <div className="relative w-full min-w-0">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('nav.askSaarthi', 'Ask Saarthi anything...')}
            className="w-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer font-multilingual font-medium truncate"
            readOnly
            onClick={() => (window.location.href = '/dashboard/ai')}
          />
        </div>
      </div>

      {/* Right Action Icons, Language Switcher, Dark Mode Switcher & Organization */}
      <div className="flex items-center gap-1.5 sm:gap-3 relative shrink-0">
        <LanguageSwitcher variant="header" />

        <button
          onClick={toggleTheme}
          title="Toggle Dark Mode"
          aria-label="Toggle Theme Mode"
          className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 font-medium max-w-[160px] truncate">
          <Building2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="truncate">{session.organizationName}</span>
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifs && (
            <div className="fixed inset-x-3 sm:inset-auto sm:right-0 top-16 sm:top-full mt-2 w-auto sm:w-80 max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-white">{t('nav.notifications', 'Notifications')} ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                  >
                    {t('nav.markAllRead', 'Mark all read')}
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-zinc-400 text-center py-4 text-xs">{t('nav.noNotifications', 'No notifications yet.')}</p>
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

export const MobileBottomNav: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();
  const { t } = useApp();

  const bottomNavItems = [
    { name: t('nav.dashboard', 'Home'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.customers', 'Clients'), href: '/dashboard/customers', icon: Users },
    { name: t('nav.aiWorkspace', 'AI Chat'), href: '/dashboard/ai', icon: Sparkles },
    { name: t('nav.bookings', 'Bookings'), href: '/dashboard/bookings', icon: Calendar },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around px-2 shadow-lg">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.name}</span>
          </Link>
        );
      })}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">{t('nav.more', 'Menu')}</span>
      </button>
    </nav>
  );
};
