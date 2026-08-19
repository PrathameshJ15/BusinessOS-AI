'use client';

import React, { useState } from 'react';
import { Scissors, Stethoscope, Utensils, Dumbbell, Home, Briefcase, UserCheck } from 'lucide-react';

export const IndustrySelector: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('salon');

  const industries = [
    {
      id: 'salon',
      name: 'Salons & Spas',
      icon: Scissors,
      prompt: 'Re-engage clients who haven\'t booked a hair spa in 30 days',
      benefit: 'Boost repeat client visits by 35% with automated WhatsApp discount flashes.',
    },
    {
      id: 'clinic',
      name: 'Clinics & Wellness',
      icon: Stethoscope,
      prompt: 'Send automated appointment reminders and consultation prep',
      benefit: 'Reduce no-shows to under 2% with scheduled SMS patient reminders.',
    },
    {
      id: 'restaurant',
      name: 'Restaurants & Cafes',
      icon: Utensils,
      prompt: 'Promote weekend festive package for corporate lunch bookings',
      benefit: 'Drive table reservations directly through custom AI landing pages.',
    },
    {
      id: 'gym',
      name: 'Gyms & Fitness',
      icon: Dumbbell,
      prompt: 'Identify members whose quarterly pass is expiring next week',
      benefit: 'Automate membership renewal reminders with instant Razorpay links.',
    },
    {
      id: 'realestate',
      name: 'Real Estate Agencies',
      icon: Home,
      prompt: 'Show my hottest leads for luxury 3BHK listings in Hyderabad',
      benefit: 'Track lead stages from proposal to closing in visual CRM Kanban.',
    },
  ];

  const activeInd = industries.find((i) => i.id === selectedIndustry) || industries[0];

  return (
    <section id="industries" className="py-20 px-6 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Tailored For Every Industry</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Local Businesses & Service Providers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your industry to explore specialized Saarthi workflow automation.
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {industries.map((ind) => {
            const Icon = ind.icon;
            const isSelected = selectedIndustry === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind.id)}
                className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all space-y-2 flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{ind.name}</span>
              </button>
            );
          })}
        </div>

        {/* Industry Detail Box */}
        <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 max-w-3xl mx-auto text-center">
          <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">Example Industry Action</span>
          <h3 className="text-xl font-bold text-white">"{activeInd.prompt}"</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl mx-auto">{activeInd.benefit}</p>
        </div>
      </div>
    </section>
  );
};
