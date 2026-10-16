'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Logo } from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, t } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.services', 'Services'), href: '#services' },
    { label: t('nav.howItWorks', 'How It Works'), href: '#how-it-works' },
    { label: t('nav.product', 'Product'), href: '#product' },
    { label: t('nav.results', 'Results'), href: '#results' },
    { label: t('nav.caseStudies', 'Case Studies'), href: '#case-studies' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo href="/" size={34} showText textVariant="landing" priority />

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="landing" />

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>

            <Link
              href="/login"
              className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              {t('nav.signIn', 'Sign In')}
            </Link>

            <Link
              href="/dashboard"
              className="hidden sm:flex px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] rounded-lg transition-all items-center gap-2 shadow-sm"
            >
              <span>{t('nav.dashboard', 'Dashboard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-[#09090b] pt-20 px-6 lg:hidden">
          <nav className="flex flex-col gap-1">
            <div className="pb-3 mb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('nav.language', 'Language')}</span>
              <LanguageSwitcher variant="landing" />
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-4 text-base font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full flex px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-sm rounded-lg transition-all items-center justify-center gap-2"
              >
                <span>{t('nav.signInWithGoogle', 'Sign In with Google')}</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full flex px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-all items-center justify-center gap-2"
              >
                <span>{t('nav.dashboard', 'Dashboard')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
