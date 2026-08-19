'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Wrench, Zap, TrendingUp } from 'lucide-react';

const steps = [
  { number: '01', title: 'Discover', description: 'We analyze your business processes, identify bottlenecks, and map opportunities for intelligent automation.', icon: Search },
  { number: '02', title: 'Build', description: 'Custom AI workflows designed around your exact business logic, integrations, and team structure.', icon: Wrench },
  { number: '03', title: 'Automate', description: 'Deploy intelligent agents that handle tasks autonomously — from customer follow-ups to campaign execution.', icon: Zap },
  { number: '04', title: 'Optimize', description: 'Continuous learning and refinement. Your automation gets smarter with every interaction and data point.', icon: TrendingUp },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-zinc-100/60 dark:bg-zinc-900/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Process
          </span>
          <h2 className="text-major text-zinc-900 dark:text-white">
            How it works
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            From discovery to deployment — a systematic approach to transforming your business operations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-zinc-300 dark:bg-zinc-800 z-0" />
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-[104px] h-[104px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center mb-6 shadow-sm">
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{step.number}</span>
                  <Icon className="w-5 h-5 text-zinc-900 dark:text-white mt-1.5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[200px]">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
