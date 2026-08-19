'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto text-center">
        <div className="p-12 sm:p-16 rounded-3xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-major text-zinc-900 dark:text-white">Ready to automate your business?</h2>
            <p className="text-sm font-devanagari text-zinc-500 dark:text-zinc-400 font-medium">तुमच्या व्यवसायाला एक सारथी द्या.</p>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">Join modern business owners who manage customers, bookings, marketing, and operations with one intelligent AI workspace.</p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard" className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
                <span>Start with Saarthi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#services" className="px-6 py-3.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium text-sm transition-colors">Learn more</a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
