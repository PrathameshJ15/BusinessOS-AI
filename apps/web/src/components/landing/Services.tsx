'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, Bot, Zap, Settings2, Plug, BarChart3, Megaphone, Wand2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Services: React.FC = () => {
  const { t } = useApp();

  const services = [
    { icon: Workflow, title: t('landing.serviceAiAutoTitle', 'AI Automation'), description: t('landing.serviceAiAutoDesc', 'End-to-end intelligent automation that understands your business context and executes accordingly.') },
    { icon: Zap, title: t('landing.serviceWorkflowTitle', 'Workflow Automation'), description: t('landing.serviceWorkflowDesc', 'Streamline repetitive tasks with smart workflows that adapt to your operational patterns.') },
    { icon: Bot, title: t('landing.serviceAgentsTitle', 'AI Agents'), description: t('landing.serviceAgentsDesc', 'Deploy autonomous AI agents that handle customer interactions, scheduling, and follow-ups.') },
    { icon: Settings2, title: t('landing.serviceBpaTitle', 'Business Process Automation'), description: t('landing.serviceBpaDesc', 'Transform manual processes into automated pipelines — from invoicing to customer onboarding.') },
    { icon: Plug, title: t('landing.serviceIntegrationsTitle', 'AI Integrations'), description: t('landing.serviceIntegrationsDesc', 'Connect with WhatsApp, Google Business, Razorpay, and your existing tools seamlessly.') },
    { icon: BarChart3, title: t('landing.serviceAnalyticsTitle', 'Data & Analytics'), description: t('landing.serviceAnalyticsDesc', 'Real-time revenue pulse, growth forecasts, and actionable business intelligence.') },
    { icon: Megaphone, title: t('landing.serviceMarketingTitle', 'Marketing Automation'), description: t('landing.serviceMarketingDesc', 'AI-crafted campaigns, WhatsApp broadcasts, and review management on autopilot.') },
    { icon: Wand2, title: t('landing.serviceCustomTitle', 'Custom AI Solutions'), description: t('landing.serviceCustomDesc', 'Tailored AI solutions designed specifically for your industry and business requirements.') },
  ];

  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            {t('landing.servicesBadge', 'Services')}
          </span>
          <h2 className="text-major text-zinc-900 dark:text-white">
            {t('landing.servicesTitle', 'Everything your business needs to automate')}
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t('landing.servicesSubtitle', 'Comprehensive AI automation capabilities built into one intelligent platform.')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/80 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

