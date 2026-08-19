'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Command,
  Send,
  CheckCircle2,
  Bot,
} from 'lucide-react';

interface SimulationScenario {
  id: string;
  command: string;
  marathiTag?: string;
  progressSteps: string[];
  saarthiInitial: string;
  contextData: {
    label: string;
    value: string;
    subtext: string;
    color: string;
  }[];
  proposal: string;
  primaryActionLabel: string;
}

export const AICommand: React.FC = () => {
  const scenarios: SimulationScenario[] = [
    {
      id: 'inactive_marathi',
      command: 'माझे निष्क्रिय ग्राहक शोधा',
      marathiTag: 'माझे निष्क्रिय ग्राहक शोधा.',
      progressSteps: [
        'समजून घेत आहे (Understanding request)...',
        'निष्क्रिय ग्राहक शोधत आहे (Checking customer records)...',
        'शिफारस तयार करत आहे (Preparing recommendation)...',
      ],
      saarthiInitial: 'मागील ३०+ दिवसांत बुकिंग न केलेल्या ग्राहकांचे विश्लेषण करत आहे (Analyzing dormant accounts)...',
      contextData: [
        { label: 'निष्क्रिय ग्राहक (Dormant Clients)', value: '127 Clients', subtext: '30+ Days inactive', color: '#F59E0B' },
        { label: 'संभाव्य महसूल (Revenue Value)', value: '₹48,500', subtext: 'Historical LTV potential', color: '#10B981' },
        { label: 'अंदाजे प्रतिसाद (Est Response)', value: '35%', subtext: 'Campaign engagement rate', color: '#3B82F6' },
      ],
      proposal: '१२७ निष्क्रिय ग्राहक आढळले (127 inactive customers found). तुमच्यासाठी २०% सवलतीचा WhatsApp मोहिमेचा मसुदा तयार केला आहे.',
      primaryActionLabel: 'Create Reactivation Campaign',
    },
    {
      id: 'website',
      command: 'Build my website',
      progressSteps: [
        'Analyzing business profile...',
        'Structuring page layout schema...',
        'Generating interactive components...',
      ],
      saarthiInitial: 'Generating a responsive business website based on your brand profile...',
      contextData: [
        { label: 'Page Layout', value: '4 Pages', subtext: 'Hero, Services, Reviews, Contact', color: '#3B82F6' },
        { label: 'Brand Theme', value: 'Premium Slate', subtext: 'Tailored color tokens', color: '#8B5CF6' },
        { label: 'Lead Forms', value: 'Active', subtext: 'Connected to CRM database', color: '#10B981' },
      ],
      proposal: 'Website structure built! Ready to publish to https://lumina-luxe.businessos.app.',
      primaryActionLabel: 'Publish AI Website',
    },
    {
      id: 'sales',
      command: 'Why are sales down?',
      progressSteps: [
        'Analyzing monthly revenue pulse...',
        'Comparing service breakdown...',
        'Identifying drop factors...',
      ],
      saarthiInitial: 'Analyzing monthly revenue trends and service category booking metrics...',
      contextData: [
        { label: 'MoM Revenue Delta', value: '-12%', subtext: 'Compared to previous period', color: '#EF4444' },
        { label: 'Primary Factor', value: 'Weekend Slots', subtext: '18% drop in haircut bookings', color: '#F59E0B' },
        { label: 'Recovery Target', value: '₹24,000', subtext: 'Projected campaign lift', color: '#10B981' },
      ],
      proposal: 'Sales are down 12% due to low weekend slot occupancy. Recommend launching a weekend flash promo.',
      primaryActionLabel: 'Launch Weekend Campaign',
    },
    {
      id: 'campaign',
      command: 'Create a weekend campaign',
      progressSteps: [
        'Selecting target audience segment...',
        'Drafting WhatsApp copy...',
        'Formatting discount offer...',
      ],
      saarthiInitial: 'Drafting an automated WhatsApp flash sale campaign for weekend bookings...',
      contextData: [
        { label: 'Target Audience', value: '127 Clients', subtext: 'Segmented inactive list', color: '#8B5CF6' },
        { label: 'Channel', value: 'WhatsApp', subtext: 'Sandbox adapter ready', color: '#3B82F6' },
        { label: 'Offer Promo Code', value: 'WEEKEND20', subtext: '20% off all spa services', color: '#10B981' },
      ],
      proposal: 'Drafted WhatsApp Campaign: "Get 20% off Spa services this weekend with promo WEEKEND20". Ready for broadcast.',
      primaryActionLabel: 'Approve & Broadcast Offer',
    },
    {
      id: 'appointments',
      command: 'Show today\'s appointments',
      progressSteps: [
        'Scanning staff calendar slots...',
        'Verifying appointment statuses...',
        'Loading client details...',
      ],
      saarthiInitial: 'Retrieving today\'s scheduled appointments from staff calendars...',
      contextData: [
        { label: 'Today Confirmed', value: '3 Bookings', subtext: '100% capacity filled', color: '#10B981' },
        { label: 'Assigned Staff', value: 'Priya & Vikram', subtext: 'Stylists on duty', color: '#3B82F6' },
        { label: 'Total Value', value: '₹4,500', subtext: 'Pending collection', color: '#F59E0B' },
      ],
      proposal: 'You have 3 confirmed bookings today. Rahul Sharma at 10:00 AM, Sarah Miller at 2:00 PM.',
      primaryActionLabel: 'View Booking Calendar',
    },
  ];

  const [selectedId, setSelectedId] = useState('inactive_marathi');
  const [stepIndex, setStepIndex] = useState(0);
  const [activeProgressStep, setActiveProgressStep] = useState(0);
  const [inputVal, setInputVal] = useState(scenarios[0].command);
  const [actionDone, setActionDone] = useState(false);

  const currentScenario = scenarios.find((s) => s.id === selectedId) || scenarios[0];

  const handleRunSimulation = (sc: SimulationScenario) => {
    setSelectedId(sc.id);
    setInputVal(sc.command);
    setStepIndex(1);
    setActiveProgressStep(0);
    setActionDone(false);

    setTimeout(() => setActiveProgressStep(1), 500);
    setTimeout(() => setActiveProgressStep(2), 1000);
    setTimeout(() => setStepIndex(2), 1500);
  };

  return (
    <section id="command" className="py-20 px-6 bg-slate-900/60 backdrop-blur-sm text-white border-t border-b border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Title with Marathi Sub-tag */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE PRODUCT EXPERIENCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tell Saarthi what you want to achieve.
          </h2>

          {/* Marathi Editorial Micro-Tag */}
          <p className="text-xs sm:text-sm font-devanagari text-blue-400 font-medium">
            व्यवसायासाठी बुद्धिमान साथीदार
          </p>

          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Experience how Saarthi transforms natural prompts into actionable business execution.
          </p>
        </div>

        {/* Suggested Command Chips */}
        <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
          {scenarios.map((sc) => {
            const isSelected = selectedId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleRunSimulation(sc)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30 scale-105'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                } ${sc.id === 'inactive_marathi' ? 'font-devanagari' : ''}`}
              >
                <Command className="w-3.5 h-3.5 text-blue-400" />
                <span>"{sc.command}"</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Simulation Sandbox Window */}
        <div className="max-w-4xl mx-auto bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunSimulation(currentScenario);
            }}
            className="bg-slate-900 p-3 rounded-2xl border border-slate-800 focus-within:border-blue-500/60 transition-all flex items-center gap-3"
          >
            <Bot className="w-5 h-5 text-blue-400 shrink-0" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask Saarthi anything..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Execute</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Sequential Step Execution Feed */}
          <div className="space-y-4">
            {/* User Request Bubble */}
            <div className="flex items-start gap-3 justify-end">
              <div className={`p-3.5 rounded-2xl bg-blue-600 text-white text-xs font-semibold shadow-md ${currentScenario.id === 'inactive_marathi' ? 'font-devanagari' : ''}`}>
                "{currentScenario.command}"
              </div>
              <div className="w-7 h-7 rounded-xl bg-blue-600/30 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/40">
                You
              </div>
            </div>

            {/* Progress Status Indicator */}
            {stepIndex === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-blue-400 font-mono bg-slate-900 p-3 rounded-2xl border border-slate-800/80 w-fit"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                <span className={currentScenario.id === 'inactive_marathi' ? 'font-devanagari' : ''}>
                  {currentScenario.progressSteps[activeProgressStep]}
                </span>
              </motion.div>
            )}

            {/* Final Saarthi Result & Context Transformation */}
            {stepIndex === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Saarthi Response Bubble */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-1">
                    <p className="font-bold text-white">Saarthi Intelligence Analysis:</p>
                    <p className={currentScenario.id === 'inactive_marathi' ? 'font-devanagari' : ''}>
                      {currentScenario.saarthiInitial}
                    </p>
                  </div>
                </div>

                {/* Context Metric Cards Transformation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {currentScenario.contextData.map((d, i) => (
                    <motion.div
                      key={d.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1"
                    >
                      <span className={`text-[10px] text-slate-400 font-medium uppercase tracking-wider block ${currentScenario.id === 'inactive_marathi' ? 'font-devanagari' : ''}`}>
                        {d.label}
                      </span>
                      <p className="text-lg font-extrabold text-white mt-0.5" style={{ color: d.color }}>
                        {d.value}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block">{d.subtext}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Action Proposal & Interactive Buttons */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className={`text-xs text-slate-300 leading-normal max-w-md ${currentScenario.id === 'inactive_marathi' ? 'font-devanagari' : ''}`}>
                    {currentScenario.proposal}
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    {actionDone ? (
                      <span className="px-3.5 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Action Triggered</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => setActionDone(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all hover:scale-105"
                        >
                          {currentScenario.primaryActionLabel}
                        </button>
                        <button
                          onClick={() => setStepIndex(0)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                        >
                          Not Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Simulation Footer Tag */}
          <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Interactive SaaS Product Walkthrough Mode</span>
            <span>Real-time Workspace Simulation</span>
          </div>
        </div>
      </div>
    </section>
  );
};
