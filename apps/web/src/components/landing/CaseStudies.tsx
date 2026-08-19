'use client';

import React from 'react';
import { motion } from 'framer-motion';

const caseStudies = [
  { client: 'Lumina Luxe Spa', industry: 'Salon & Wellness', problem: 'Manual appointment scheduling, no client retention strategy, scattered customer data across spreadsheets.', solution: 'AI-powered CRM with automated booking, WhatsApp reactivation campaigns, and Google Review management.', result: '127 dormant clients reactivated, 24% increase in weekend bookings, 4.9★ Google rating maintained.', metric: '+24%', metricLabel: 'Revenue Growth' },
  { client: 'GrowthStack Agency', industry: 'Digital Agency', problem: 'Manual invoicing, lost leads due to slow follow-up, no centralized client pipeline.', solution: 'Automated lead pipeline with AI scoring, Razorpay invoice generation, and multi-channel campaign management.', result: 'Lead response time reduced from 48h to 15min, invoice processing automated for 12 retainer clients.', metric: '10x', metricLabel: 'Faster Response' },
  { client: 'HealthFirst Clinic', industry: 'Healthcare', problem: 'Patient no-shows, manual appointment reminders, no follow-up tracking system.', solution: 'Automated WhatsApp reminders, AI-drafted follow-up schedules, and patient engagement workflows.', result: 'No-show rate dropped to 0%, 100% reminder delivery, 8 automated follow-up sequences deployed.', metric: '0%', metricLabel: 'No-show Rate' },
];

export const CaseStudies: React.FC = () => {
  return (
    <section id="case-studies" className="py-24 px-6 bg-zinc-100/60 dark:bg-zinc-900/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Case Studies
          </span>
          <h2 className="text-major text-zinc-900 dark:text-white">
            Real results, real businesses
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            See how businesses across industries are transforming their operations with Saarthi AI.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {caseStudies.map((study, idx) => (
            <motion.div
              key={study.client}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{study.client}</h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{study.industry}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">{study.metric}</p>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{study.metricLabel}</span>
                </div>
              </div>
              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-white">Challenge:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-1">{study.problem}</span>
                </div>
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-white">Solution:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-1">{study.solution}</span>
                </div>
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Result:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-1">{study.result}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
