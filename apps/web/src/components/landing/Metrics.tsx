'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

export const Metrics: React.FC = () => {
  const { t } = useApp();

  const metrics = [
    { value: '200+', label: t('landing.metricWorkflows', 'Workflows Automated'), description: t('landing.metricWorkflowsDesc', 'Across diverse industries') },
    { value: '95%', label: t('landing.metricSatisfaction', 'Client Satisfaction'), description: t('landing.metricSatisfactionDesc', 'Consistently rated excellent') },
    { value: '30%+', label: t('landing.metricEfficiency', 'Efficiency Improvement'), description: t('landing.metricEfficiencyDesc', 'Average across all clients') },
    { value: '10x', label: t('landing.metricSpeed', 'Faster Operations'), description: t('landing.metricSpeedDesc', 'Compared to manual processes') },
  ];

  return (
    <section id="results" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            {t('landing.resultsBadge', 'Results')}
          </span>
          <h2 className="text-major text-zinc-900 dark:text-white">
            {t('landing.resultsTitle', 'Numbers that speak')}
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <p className="text-metric text-emerald-600 dark:text-emerald-400 font-extrabold">
                {metric.value}
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-2">
                {metric.label}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

