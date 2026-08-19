'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Stethoscope,
  Utensils,
  Dumbbell,
  Briefcase,
  UserCheck,
  Building,
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface IndustryItem {
  id: string;
  name: string;
  icon: any;
  color: string;
  headline: string;
  modules: {
    title: string;
    value: string;
    subtext: string;
  }[];
  aiPromptExample: string;
  aiResponse: string;
}

export const IndustrySelector: React.FC = () => {
  const industries: IndustryItem[] = [
    {
      id: 'salon',
      name: 'Salon & Spa',
      icon: Scissors,
      color: '#EC4899',
      headline: 'Automate appointments, client retention & Google reviews.',
      modules: [
        { title: 'Today Bookings', value: '14 Slots', subtext: '92% Capacity Filled' },
        { title: 'Active Clients', value: '428 Record', subtext: 'Avg LTV ₹5,200' },
        { title: 'Popular Service', value: 'Keratin & Spa', subtext: '₹3,500 Avg Bill' },
        { title: 'Review Rating', value: '4.9 ★', subtext: '128 Verified Reviews' },
      ],
      aiPromptExample: 'Find salon clients who haven\'t booked a hair treatment in 45 days.',
      aiResponse: '18 clients identified. Drafted a 20% WhatsApp offer for weekend Keratin treatments.',
    },
    {
      id: 'clinic',
      name: 'Clinic & Wellness',
      icon: Stethoscope,
      color: '#06B6D4',
      headline: 'Patient appointments, automated SMS reminders & follow-ups.',
      modules: [
        { title: 'Appointments', value: '18 Consults', subtext: 'Dr. Sharma Schedule' },
        { title: 'Patients/Clients', value: '620 Records', subtext: 'EMR Sync Active' },
        { title: 'Reminders Sent', value: '100% Sent', subtext: '0 No-show rate' },
        { title: 'Follow-ups', value: '8 Scheduled', subtext: 'Post-op checkups' },
      ],
      aiPromptExample: 'Send automated WhatsApp reminders to patients with consults tomorrow.',
      aiResponse: 'Queued 12 appointment reminders for tomorrow morning with location link.',
    },
    {
      id: 'restaurant',
      name: 'Restaurant & Cafe',
      icon: Utensils,
      color: '#F97316',
      headline: 'Table reservations, weekend promo broadcasts & review replies.',
      modules: [
        { title: 'Bookings', value: '24 Tables', subtext: 'Friday Evening Full' },
        { title: 'Dine-in Customers', value: '1,240 List', subtext: 'Loyalty Program' },
        { title: 'Review Rating', value: '4.8 ★', subtext: 'AI Reply Drafted' },
        { title: 'Marketing Lift', value: '+24% Rev', subtext: 'Weekend Flash Promo' },
      ],
      aiPromptExample: 'Create a weekend discount offer for customers who dined last month.',
      aiResponse: 'Segmented 85 dining guests. Drafted "15% off weekend dinner" WhatsApp broadcast.',
    },
    {
      id: 'gym',
      name: 'Gym & Fitness',
      icon: Dumbbell,
      color: '#10B981',
      headline: 'Member subscriptions, personal training slots & churn alerts.',
      modules: [
        { title: 'Active Members', value: '310 Active', subtext: 'Annual Subscriptions' },
        { title: 'PT Bookings', value: '9 Sessions', subtext: 'Trainer Schedule' },
        { title: 'Campaigns', value: 'WhatsApp', subtext: 'Renewal Broadcast' },
        { title: 'Retention Rate', value: '94%', subtext: 'Low Churn Risk' },
      ],
      aiPromptExample: 'Show gym members whose memberships expire in the next 7 days.',
      aiResponse: '14 expiring memberships found. Prepared auto-renewal discount links.',
    },
    {
      id: 'agency',
      name: 'Agency & Services',
      icon: Briefcase,
      color: '#3B82F6',
      headline: 'Lead pipeline, client invoicing & project task tracking.',
      modules: [
        { title: 'Qualified Leads', value: '22 Leads', subtext: '₹4.2L Deal Pipeline' },
        { title: 'Retainer Clients', value: '12 Accounts', subtext: 'Monthly Invoicing' },
        { title: 'Active Campaigns', value: '6 Live', subtext: 'FB & Google Ads' },
        { title: 'Tasks Pending', value: '5 Milestones', subtext: 'On Schedule' },
      ],
      aiPromptExample: 'Draft Razorpay invoices for retainer clients due on the 1st.',
      aiResponse: 'Drafted 12 monthly retainer invoices totaling ₹3,60,000. Ready for approval.',
    },
    {
      id: 'consultant',
      name: 'Consultant & Advisory',
      icon: UserCheck,
      color: '#8B5CF6',
      headline: 'Consultation bookings, lead scoring & automated follow-ups.',
      modules: [
        { title: 'Incoming Leads', value: '15 Inquiries', subtext: 'High Intent' },
        { title: 'Advisory Clients', value: '8 Retainers', subtext: 'Weekly Syncs' },
        { title: 'Appointments', value: '6 Calls Today', subtext: 'Google Meet Linked' },
        { title: 'Follow-ups', value: '4 Pending', subtext: 'Proposal Reviews' },
      ],
      aiPromptExample: 'Summarize today\'s consultation calls and draft proposal emails.',
      aiResponse: 'Summarized key requirements for 3 clients and generated custom proposal drafts.',
    },
    {
      id: 'realestate',
      name: 'Real Estate Broker',
      icon: Building,
      color: '#6366F1',
      headline: 'Property inquiry leads, site visit schedules & automated CRM.',
      modules: [
        { title: 'Buyer Leads', value: '38 Hot Leads', subtext: 'Luxury Apartment' },
        { title: 'Properties Listed', value: '14 Active', subtext: '₹85L - ₹2.5Cr' },
        { title: 'Site Visit Slots', value: '5 Weekend', subtext: 'Confirmed Visits' },
        { title: 'Follow-ups', value: '12 Reminders', subtext: 'WhatsApp Catalogs' },
      ],
      aiPromptExample: 'Find buyers looking for 3BHK apartments under ₹1.5 Cr.',
      aiResponse: 'Filtered 14 matching leads. Prepared WhatsApp property brochure links.',
    },
    {
      id: 'repair',
      name: 'Repair & Field Work',
      icon: Wrench,
      color: '#EAB308',
      headline: 'Job tickets, technician dispatching & customer SMS updates.',
      modules: [
        { title: 'Customer List', value: '540 Records', subtext: 'Annual Maintenance' },
        { title: 'Open Jobs', value: '9 Tickets', subtext: 'Field Technicians' },
        { title: 'Appointments', value: '4 On-site', subtext: 'AC & Appliance' },
        { title: 'Notifications', value: 'SMS/WhatsApp', subtext: 'Live ETA Alerts' },
      ],
      aiPromptExample: 'Assign unassigned repair tickets to available field technicians.',
      aiResponse: 'Assigned 3 AC repair tickets to Tech Suresh with route optimization.',
    },
  ];

  const [selectedId, setSelectedId] = useState('salon');
  const activeIndustry = industries.find((i) => i.id === selectedId) || industries[0];

  return (
    <section id="industries" className="py-24 px-6 bg-slate-900/60 backdrop-blur-sm text-white border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TAILORED INDUSTRY SOLUTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Built for businesses like yours.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your industry to see how Saarthi AI adapts its intelligence workspace to your business domain.
          </p>
        </div>

        {/* Industry Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
          {industries.map((ind) => {
            const Icon = ind.icon;
            const isSelected = selectedId === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setSelectedId(ind.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-950 text-white shadow-lg scale-105'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
                style={{ borderColor: isSelected ? ind.color : undefined }}
              >
                <Icon className="w-4 h-4" style={{ color: ind.color }} />
                <span>{ind.name}</span>
              </button>
            );
          })}
        </div>

        {/* Industry Product Demo Frame */}
        <div className="max-w-4xl mx-auto bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndustry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Industry Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                    style={{ backgroundColor: `${activeIndustry.color}15`, borderColor: `${activeIndustry.color}40` }}
                  >
                    <activeIndustry.icon className="w-5 h-5" style={{ color: activeIndustry.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{activeIndustry.name} Workspace</h3>
                    <p className="text-xs text-slate-400">{activeIndustry.headline}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  Domain Profile: Active
                </span>
              </div>

              {/* 4 Tailored Module Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {activeIndustry.modules.map((m) => (
                  <div key={m.title} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{m.title}</span>
                    <p className="text-base sm:text-lg font-extrabold text-white" style={{ color: activeIndustry.color }}>
                      {m.value}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block">{m.subtext}</span>
                  </div>
                ))}
              </div>

              {/* Saarthi Prompt Execution Card */}
              <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">DEMO PROMPT FOR {activeIndustry.name.toUpperCase()}</span>
                  <span className="text-blue-400 font-bold">Saarthi Command</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white font-medium">
                  "{activeIndustry.aiPromptExample}"
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{activeIndustry.aiResponse}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer Tag */}
          <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Illustrative Product Demonstration Data</span>
            <span>Saarthi Domain Context Engine</span>
          </div>
        </div>
      </div>
    </section>
  );
};
