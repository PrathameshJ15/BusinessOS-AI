'use client';

import React from 'react';
import { ShieldCheck, Cpu, Database, Lock } from 'lucide-react';

export const IntelligenceSection: React.FC = () => {
  return (
    <section id="intelligence" className="py-20 px-6 bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Enterprise-Grade Security</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Architecture Built for Trust
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Saarthi never blindly sends your entire database to third parties or executes unverified write actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Provider Abstraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch dynamically between OpenAI GPT-4o, Anthropic Claude, Gemini 1.5, and Groq without changing your code or data models.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">RBAC Security Guard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Role-based access control enforces permissions at the tool layer. Staff roles cannot trigger financial or marketing broadcasts.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Sensitive Action Confirmation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              WRITE operations require explicit visual user confirmation cards before executing real-world broadcasts or invoice issuances.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
