'use client';

import React, { useState } from 'react';
import { Sparkles, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';

export const AICommand: React.FC = () => {
  const [activePrompt, setActivePrompt] = useState('How is my business performing?');
  const [outputResult, setOutputResult] = useState({
    title: 'Executive Business Summary',
    details: 'Revenue this month is ₹84,000 (+14% growth). 14 inactive clients identified for re-engagement. 3 bookings confirmed today.',
    status: 'COMPLETED',
    toolName: 'get_business_summary',
  });

  const promptOptions = [
    {
      text: 'How is my business performing?',
      result: {
        title: 'Executive Performance Summary',
        details: 'Monthly revenue is ₹84,000 (+14% vs last period). Highest performing service: Hydra-Facial Glow (₹38,500).',
        status: 'COMPLETED',
        toolName: 'get_revenue_insights',
      },
    },
    {
      text: 'Show inactive customers.',
      result: {
        title: 'Dormant Client Segment',
        details: 'Found 14 inactive customers (30+ days without booking). Total estimated dormant LTV: ₹48,500.',
        status: 'COMPLETED',
        toolName: 'search_customers',
      },
    },
    {
      text: 'Create a campaign.',
      result: {
        title: 'WhatsApp Broadcast Offer',
        details: 'Drafted campaign "Weekend 20% Off". Target: 14 dormant clients. Ready for broadcast approval.',
        status: 'PENDING_APPROVAL',
        toolName: 'create_campaign',
      },
    },
    {
      text: 'Build my website.',
      result: {
        title: 'AI Website Layout Built',
        details: 'Generated 4-page responsive website (Hero, Services, Reviews, Contact) matching Premium Slate theme.',
        status: 'COMPLETED',
        toolName: 'generate_website',
      },
    },
  ];

  const handleSelect = (p: typeof promptOptions[0]) => {
    setActivePrompt(p.text);
    setOutputResult(p.result);
  };

  return (
    <section id="command" className="py-20 px-6 bg-slate-900 text-white border-t border-b border-slate-800">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Interactive Command Simulator</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ask. Saarthi does the work.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Click any prompt below to watch Saarthi AI execute real-time business actions across your database and tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Prompt Chips List */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Sample Prompts:
            </span>
            {promptOptions.map((p) => (
              <button
                key={p.text}
                onClick={() => handleSelect(p)}
                className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                  activePrompt === p.text
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>"{p.text}"</span>
                <ArrowRight className={`w-4 h-4 transition-transform ${activePrompt === p.text ? 'translate-x-1' : ''}`} />
              </button>
            ))}
          </div>

          {/* Execution Terminal Result Box */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white">SAARTHI ENGINE EXECUTION</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {outputResult.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-400">Command: <span className="text-white">"{activePrompt}"</span></p>
              <p className="text-slate-400">Tool: <span className="text-blue-400">{outputResult.toolName}</span></p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800/80 space-y-2 text-xs font-sans">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{outputResult.title}</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">{outputResult.details}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
