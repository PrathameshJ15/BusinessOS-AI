'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Bot, ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 relative">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Business Automation
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-4">
          <h1 className="text-hero text-zinc-900 dark:text-white">
            Your business has a new <span className="text-emerald-600 dark:text-emerald-400">Saarthi</span>.
          </h1>
          <p className="text-sm font-devanagari text-zinc-500 dark:text-zinc-400 font-medium">
            तुमच्या व्यवसायाचा नवा सारथी.
          </p>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          One intelligent workspace that understands your business, takes action, and helps you grow — from customer management to marketing automation.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
            <span>Start with Saarthi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#how-it-works" className="px-6 py-3.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-sm rounded-xl transition-all">
            See how it works
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Enterprise Security</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Multi-Provider AI</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Role-Based Access</span>
        </motion.div>

        {/* Workflow Visualization */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="pt-10 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
            <div className="flex flex-col items-center gap-2">
              <div className="w-48 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center"><span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">1</span></div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white">Your Business</span>
                </div>
                <div className="space-y-1.5"><div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full"></div><div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full w-3/4"></div></div>
              </div>
            </div>

            <div className="hidden sm:flex items-center"><div className="w-12 h-px bg-zinc-300 dark:bg-zinc-700"></div><ArrowRight className="w-3.5 h-3.5 text-zinc-400 -ml-1" /></div>
            <div className="sm:hidden flex items-center"><ArrowDown className="w-3.5 h-3.5 text-zinc-400" /></div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-48 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-sm text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Saarthi AI</span>
                </div>
                <div className="space-y-1.5"><div className="h-2 bg-emerald-200 dark:bg-emerald-900/60 rounded-full w-full animate-flow-pulse"></div><div className="h-2 bg-emerald-200 dark:bg-emerald-900/60 rounded-full w-2/3 animate-flow-pulse" style={{ animationDelay: '0.5s' }}></div></div>
              </div>
            </div>

            <div className="hidden sm:flex items-center"><div className="w-12 h-px bg-zinc-300 dark:bg-zinc-700"></div><ArrowRight className="w-3.5 h-3.5 text-zinc-400 -ml-1" /></div>
            <div className="sm:hidden flex items-center"><ArrowDown className="w-3.5 h-3.5 text-zinc-400" /></div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-48 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 shadow-sm text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Automated</span>
                </div>
                <div className="space-y-1.5"><div className="h-2 bg-emerald-100 dark:bg-emerald-950/80 rounded-full w-full"></div><div className="h-2 bg-emerald-100 dark:bg-emerald-950/80 rounded-full w-5/6"></div></div>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-6 font-mono tracking-tight">
            Business → AI Layer → Automated Actions
          </p>
        </motion.div>
      </div>
    </section>
  );
};
