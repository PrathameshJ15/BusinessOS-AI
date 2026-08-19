'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  { quote: 'Saarthi AI transformed how we manage our salon. Dormant clients are now returning, reviews are being managed automatically, and our team has more time to focus on what matters.', name: 'Ananya Verma', company: 'Lumina Luxe Spa', role: 'Owner & Founder' },
  { quote: 'The AI workspace is incredibly intuitive. I ask it questions in natural language — even in Marathi — and it understands exactly what I need. It\'s like having a brilliant business partner.', name: 'Ramesh Kumar', company: 'GrowthStack Digital', role: 'Managing Director' },
  { quote: 'Our patient no-show rate dropped to zero after implementing automated WhatsApp reminders. The system just works — reliably and intelligently.', name: 'Dr. Priya Sharma', company: 'HealthFirst Clinic', role: 'Chief Medical Officer' },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="text-major text-zinc-900 dark:text-white">
            Trusted by business owners
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <Quote className="w-5 h-5 text-emerald-500/40 mb-4" />
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.role}, {t.company}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
