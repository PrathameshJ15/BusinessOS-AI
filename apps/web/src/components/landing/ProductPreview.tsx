'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Megaphone, Calendar, Sparkles, ExternalLink, TrendingUp, Lock } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'marketing' | 'bookings' | 'ai'>('dashboard');
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'ai', label: 'AI Workspace', icon: Sparkles },
  ];

  return (
    <section id="product" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Product
          </span>
          <h2 className="text-major text-zinc-900 dark:text-white">
            Everything your business needs. One workspace.
          </h2>
          <p className="text-xs font-devanagari text-zinc-500 dark:text-zinc-400 font-medium">
            तुमचा व्यवसाय, अधिक स्मार्ट.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden"
        >
          <div className="bg-zinc-100 dark:bg-zinc-950 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <div className="bg-white dark:bg-zinc-900 px-4 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 max-w-xs w-full justify-center">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>app.saarthi.ai/{activeTab}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Preview</span>
          </div>

          <div className="p-6 sm:p-8 min-h-[400px] bg-zinc-50/50 dark:bg-[#09090b]/80">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white font-display">Good morning, Lumina Luxe Spa</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Here is what needs your attention today.</p>
                    </div>
                    <button onClick={() => (window.location.href = '/dashboard/ai')} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask Saarthi</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono">Revenue Today</span>
                      <p className="text-2xl font-display font-bold text-zinc-900 dark:text-white mt-1">₹3,450</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> +14% vs last week
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono">New Leads</span>
                      <p className="text-2xl font-display font-bold text-zinc-900 dark:text-white mt-1">14</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">3 website conversions</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono">Today Appointments</span>
                      <p className="text-2xl font-display font-bold text-zinc-900 dark:text-white mt-1">3</p>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 block">Priya Patel & Vikram Singh</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">AI Insight: 127 dormant clients identified</h4>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">Clients haven't returned in 30+ days. Recommended: Launch WhatsApp flash campaign.</p>
                      </div>
                    </div>
                    <button onClick={() => (window.location.href = '/dashboard/marketing')} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shrink-0 shadow-sm">
                      Create Campaign
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'customers' && (
                <motion.div key="customers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white font-display">Customer CRM</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">14 Active Records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 uppercase">
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Lifetime Value</th>
                          <th className="py-2.5 px-3">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        <tr>
                          <td className="py-3 px-3 font-medium text-zinc-900 dark:text-white">Ramesh Kumar</td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-medium">VIP</span></td>
                          <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400 font-display">₹8,400</td>
                          <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">+91 98765 00000</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-medium text-zinc-900 dark:text-white">Priya Mehta</td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium">Active</span></td>
                          <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400 font-display">₹4,200</td>
                          <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">+91 98111 22233</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'marketing' && (
                <motion.div key="marketing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white font-display">WhatsApp & Campaign Broadcasts</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">82 Delivered</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-900 dark:text-white">Weekend Radiance 20% Off</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium">Completed</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">"Hi Ramesh! Enjoy 20% off Hydra-Facial this weekend with promo GLOW20."</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white font-display">Today's Appointment Schedule</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">3 Appointments</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-900 dark:text-white">Rahul Sharma — Haircut & Scalp Spa</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">10:00 AM (Priya Patel)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs font-mono">USER:</span>
                    <span className="text-xs text-zinc-900 dark:text-white ml-2">"Why are my sales down?"</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs font-mono">SAARTHI AI:</span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      "Sales down 12% due to low weekend slot occupancy. Recommended: Launch a 20% flash discount campaign to 127 dormant clients."
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span>Saarthi Operating System</span>
              <button onClick={() => (window.location.href = `/dashboard/${activeTab}`)} className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                <span>Open Full Module</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
