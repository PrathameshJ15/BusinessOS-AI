'use client';

import React, { useRef, useState, useEffect } from 'react';
import { EcosystemScene } from './3d/EcosystemScene';
import { Users, Globe, Megaphone, Calendar, BarChart3, CheckCircle2 } from 'lucide-react';

export const BusinessEcosystem: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null!);
  const [scrollProgress, setScrollProgress] = useState(0.2);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = windowHeight - rect.top;
      const progress = Math.min(1, Math.max(0, currentScroll / (rect.height + windowHeight)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nodesInfo = [
    { id: 'customers', label: 'Customers CRM', marathiLabel: 'ग्राहक (Customers)', color: '#3B82F6', icon: Users, desc: 'Centralized client profiles, LTV, and deal pipeline.' },
    { id: 'website', label: 'AI Website', marathiLabel: 'वेबसाइट (Website)', color: '#8B5CF6', icon: Globe, desc: 'Structured JSON builder with live block editor.' },
    { id: 'marketing', label: 'Marketing & WhatsApp', marathiLabel: 'विपणन (Marketing)', color: '#F97316', icon: Megaphone, desc: 'Multi-channel broadcasts and Google review replies.' },
    { id: 'bookings', label: 'Bookings & Operations', marathiLabel: 'बुकिंग (Bookings)', color: '#10B981', icon: Calendar, desc: 'Calendar scheduling and Razorpay invoices.' },
    { id: 'analytics', label: 'Analytics Engine', marathiLabel: 'विश्लेषण (Analytics)', color: '#06B6D4', icon: BarChart3, desc: 'Real-time revenue pulse and growth insights.' },
  ];

  return (
    <section id="ecosystem" ref={containerRef} className="py-24 px-6 bg-slate-950/60 backdrop-blur-[1px] text-white border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Title & Marathi Micro-Tag */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">3D Ecosystem Synchronizer</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            One intelligence layer. Your entire business.
          </h2>

          {/* Marathi Micro-Tag Signature */}
          <p className="text-xs sm:text-sm font-devanagari text-blue-400 font-semibold">
            एकाच ठिकाणी. संपूर्ण व्यवसाय.
          </p>

          <p className="text-xs sm:text-sm text-slate-400">
            Scroll down to watch Saarthi connect your CRM, Website, Marketing, Bookings, and Analytics into a single operational brain.
          </p>
        </div>

        {/* 3D Ecosystem Canvas & Side Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <EcosystemScene scrollProgress={scrollProgress} />
          </div>

          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              CONNECTED BUSINESS MODULES:
            </span>
            {nodesInfo.map((node, idx) => {
              const Icon = node.icon;
              const isRevealed = scrollProgress >= (idx + 1) * 0.15;
              return (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-2xl border text-xs transition-all space-y-1 ${
                    isRevealed
                      ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: node.color }} />
                      <span>{node.label}</span>
                      <span className="text-[10px] font-devanagari text-slate-400 font-normal">({node.marathiLabel.split(' ')[0]})</span>
                    </div>
                    {isRevealed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">{node.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Synchronized Banner */}
        <div className="text-center pt-4 border-t border-slate-900 space-y-1">
          <p className="text-base sm:text-lg font-bold text-white tracking-wide font-display">
            "One workspace. One intelligent layer."
          </p>
          <p className="text-xs font-devanagari text-slate-400 font-medium">
            एकाच ठिकाणी. संपूर्ण व्यवसाय.
          </p>
        </div>
      </div>
    </section>
  );
};
