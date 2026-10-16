'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context/AppContext';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="py-16 px-6 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1 space-y-4">
            <Logo
              size={36}
              showText
              textVariant="compact"
              subtitle="सारथी AI"
            />
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[240px]">
              {t('landing.footerDesc', 'One intelligent workspace that understands your business, takes action, and helps you grow.')}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              {t('landing.footerProduct', 'Product')}
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href="#services" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.services', 'Services')}
              </a>
              <a href="#how-it-works" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.howItWorks', 'How It Works')}
              </a>
              <a href="#product" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.product', 'Product')}
              </a>
              <a href="#results" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.results', 'Results')}
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              {t('landing.footerPlatform', 'Platform')}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/dashboard" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.dashboard', 'Dashboard')}
              </Link>
              <Link href="/dashboard/customers" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.customers', 'Customers')}
              </Link>
              <Link href="/dashboard/marketing" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.marketing', 'Marketing')}
              </Link>
              <Link href="/dashboard/ai" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.aiWorkspace', 'AI Workspace')}
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              {t('landing.footerCompany', 'Company')}
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href="#case-studies" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.caseStudies', 'Case Studies')}
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Saarthi AI. {t('landing.allRightsReserved', 'All rights reserved.')}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t('nav.allSystemsOperational', 'All systems operational')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

