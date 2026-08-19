'use client';

import React from 'react';
import { MessageSquare, BrainCircuit, Zap, CheckCircle2 } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Ask in Natural Language',
      desc: 'Simply state what you want to achieve. No complex menus or manual input across multiple portals.',
      icon: MessageSquare,
      accent: '#3B82F6',
    },
    {
      num: '02',
      title: 'Saarthi Understands Context',
      desc: 'The context engine retrieves relevant database records, customer histories, and bookings without exposing raw data.',
      icon: BrainCircuit,
      accent: '#8B5CF6',
    },
    {
      num: '03',
      title: 'Executes & Confirms Actions',
      desc: 'Saarthi triggers secure tool executions. Sensitive write operations present explicit visual confirmation cards.',
      icon: Zap,
      accent: '#10B981',
    },
  ];

  return (
    <section id="workflow" className="py-20 px-6 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Operating Pipeline</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ask → Understand → Act
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            How Saarthi transforms natural language prompts into secure business execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-slate-800">{s.num}</span>
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${s.accent}20`, border: `1px solid ${s.accent}40` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: s.accent }} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
