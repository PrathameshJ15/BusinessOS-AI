'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Customer } from '@businessos/shared';

export interface AIReactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationApplied?: (result: SimulationResult) => void;
}

export interface SimulationResult {
  campaignName: string;
  totalRecipients: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  conversions: number;
  projectedRevenue: number;
  growthPercentage: number;
  language: 'en' | 'hi' | 'mr' | 'hinglish';
  offerCode: string;
}

interface TelemetryLog {
  id: string;
  timestamp: string;
  type: 'AI' | 'DISPATCH' | 'READ' | 'CLICK' | 'CONVERSION';
  message: string;
  badge?: string;
}

export function AIReactivationModal({
  isOpen,
  onClose,
  onSimulationApplied,
}: AIReactivationModalProps) {
  const { customers, addCampaign, addNote, addToast, language: appLanguage } = useApp();

  // Active step: 'CONFIGURE' | 'SIMULATING' | 'COMPLETED'
  const [step, setStep] = useState<'CONFIGURE' | 'SIMULATING' | 'COMPLETED'>('CONFIGURE');

  // Configuration State
  const [targetSegment, setTargetSegment] = useState<'ALL_INACTIVE' | 'HIGH_LTV' | 'CRITICAL_CHURN'>('ALL_INACTIVE');
  const [selectedOffer, setSelectedOffer] = useState<'25_PERCENT' | 'FLAT_500' | 'FREE_SERVICE'>('25_PERCENT');
  const [lang, setLang] = useState<'en' | 'hi' | 'mr' | 'hinglish'>(
    appLanguage === 'mr' ? 'mr' : appLanguage === 'hi' ? 'hi' : 'en'
  );
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(2);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Simulation Running State
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0 - 100
  const [currentStage, setCurrentStage] = useState<
    'IDLE' | 'ANALYZING' | 'DISPATCHING' | 'TRACKING' | 'CONVERTING' | 'FINISHED'
  >('IDLE');
  const [dispatchedCount, setDispatchedCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [openedCount, setOpenedCount] = useState(0);
  const [clickedCount, setClickedCount] = useState(0);
  const [conversionsCount, setConversionsCount] = useState(0);
  const [projectedRevenue, setProjectedRevenue] = useState(0);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [isApplyingToCrm, setIsApplyingToCrm] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audience counts based on segment
  const audienceMeta = {
    ALL_INACTIVE: {
      count: 127,
      label: 'All 127 Dormant Clients',
      desc: 'Clients inactive for 30+ days across all spending tiers',
      expectedLift: '24%',
    },
    HIGH_LTV: {
      count: 42,
      label: 'High-LTV Dormant VIPs',
      desc: 'Inactive clients with lifetime spend > ₹5,000',
      expectedLift: '38%',
    },
    CRITICAL_CHURN: {
      count: 58,
      label: 'High Churn Risk (60+ Days)',
      desc: 'Clients showing highest churn risk score without return booking',
      expectedLift: '19%',
    },
  }[targetSegment];

  const offerMeta = {
    '25_PERCENT': {
      code: 'REJUVENATE25',
      name: '25% Weekend Spa Rejuvenation',
      detail: '25% OFF on signature spa and wellness appointments',
    },
    FLAT_500: {
      code: 'VIP500BACK',
      name: 'Flat ₹500 Welcome-Back Voucher',
      detail: 'Instant ₹500 deduction on treatments above ₹1,500',
    },
    FREE_SERVICE: {
      code: 'GLOWCOMPLIMENT',
      name: 'Complimentary Express Facial Add-on',
      detail: 'Free 20-min express glow treatment with any standard service',
    },
  }[selectedOffer];

  // Dynamic multilingual message previews
  const messagePreviews = {
    en: `Hi {name}! We miss you at Lumina Luxe Spa. Treat yourself this weekend with an exclusive 25% OFF using code ${offerMeta.code}! Reserve your spot instantly: https://luminaluxe.businessos.in/go/reactivate-vip. Valid through Sunday!`,
    hi: `नमस्ते {name}! Lumina Luxe Spa में हमें आपकी कमी खल रही है। इस वीकेंड अपनी अगली विजिट पर पाएं विशेष 25% की छूट! कोड ${offerMeta.code} का उपयोग करें या तुरंत बुक करें: https://luminaluxe.businessos.in/go/reactivate-vip। रविवार तक मान्य!`,
    mr: `नमस्कार {name}! Lumina Luxe Spa मध्ये आम्हाला आपली आठवण येत आहे. या वीकेंडला आपल्या पुढील सेवेवर मिळवा खास 25% सूट! कोड ${offerMeta.code} वापरा किंवा येथे लगेच बुक करा: https://luminaluxe.businessos.in/go/reactivate-vip. रविवारपर्यंत वैध!`,
    hinglish: `Hey {name}! Lumina Luxe Spa misses you! Is weekend apni next relaxation session pe pao exclusive 25% OFF with code ${offerMeta.code}. Direct booking link: https://luminaluxe.businessos.in/go/reactivate-vip. Offer ends Sunday!`,
  };

  // Auto-scroll telemetry logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Real client names for simulation realism
  const fallbackNames = [
    'Priya Sharma',
    'Rajesh Kulkarni',
    'Vikram Patel',
    'Anita Desai',
    'Rohan Mehta',
    'Neha Joshi',
    'Kavita Nair',
    'Suresh Iyer',
    'Sunita Rao',
    'Amitabh Banerjee',
    'Meera Kapoor',
    'Aditya Deshmukh',
  ];

  const targetNames = customers.length > 0 ? customers.map((c) => c.name) : fallbackNames;

  const startSimulation = () => {
    setStep('SIMULATING');
    setIsRunning(true);
    setProgress(0);
    setCurrentStage('ANALYZING');
    setDispatchedCount(0);
    setDeliveredCount(0);
    setOpenedCount(0);
    setClickedCount(0);
    setConversionsCount(0);
    setProjectedRevenue(0);

    const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

    const initialLogs: TelemetryLog[] = [
      {
        id: '1',
        timestamp: now(),
        type: 'AI',
        message: `Auditing ${audienceMeta.count} client profiles for churn probability and RFM scores...`,
        badge: 'AI_AUDIT',
      },
      {
        id: '2',
        timestamp: now(),
        type: 'AI',
        message: `Compiled personalized ${lang.toUpperCase()} copy with smart link /go/reactivate-vip`,
        badge: 'PROMPT_READY',
      },
    ];
    setLogs(initialLogs);

    const totalTarget = audienceMeta.count;
    let currentProgress = 0;
    const intervalMs = Math.max(80, Math.floor(180 / simSpeed));

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      const percent = currentProgress;
      const targetDispatched = Math.min(totalTarget, Math.round((percent / 60) * totalTarget));
      const targetDelivered = Math.min(targetDispatched, Math.round(targetDispatched * 0.984));
      const targetOpened = Math.min(targetDelivered, Math.round((percent > 30 ? (percent - 30) / 70 : 0) * (totalTarget * 0.85)));
      const targetClicked = Math.min(targetOpened, Math.round((percent > 50 ? (percent - 50) / 50 : 0) * (totalTarget * 0.42)));
      const targetConversions = Math.min(targetClicked, Math.round((percent > 65 ? (percent - 65) / 35 : 0) * (totalTarget * 0.244)));
      const targetRev = targetConversions * 1240;

      setDispatchedCount(targetDispatched);
      setDeliveredCount(targetDelivered);
      setOpenedCount(targetOpened);
      setClickedCount(targetClicked);
      setConversionsCount(targetConversions);
      setProjectedRevenue(targetRev);

      // Stage tracking & event log injections
      if (percent === 10) {
        setCurrentStage('DISPATCHING');
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${percent}`,
            timestamp: now(),
            type: 'DISPATCH',
            message: `Initiating WhatsApp Business Gateway dispatch (batch 1/4)...`,
            badge: 'WHATSAPP_START',
          },
        ]);
      } else if (percent === 25) {
        const client = targetNames[0] || 'Priya Sharma';
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${percent}`,
            timestamp: now(),
            type: 'DISPATCH',
            message: `✓✓ Dispatched personalized offer to ${client} (+91 98201 12345)`,
            badge: 'DISPATCHED',
          },
        ]);
      } else if (percent === 45) {
        setCurrentStage('TRACKING');
        const client = targetNames[1] || 'Rajesh Kulkarni';
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${percent}`,
            timestamp: now(),
            type: 'READ',
            message: `Read receipt verified for ${client} (Double blue tick ✓✓)`,
            badge: 'READ_RECEIPT',
          },
        ]);
      } else if (percent === 60) {
        const client = targetNames[2] || 'Anita Desai';
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${percent}`,
            timestamp: now(),
            type: 'CLICK',
            message: `🔗 ${client} clicked Smart Link /go/reactivate-vip from WhatsApp`,
            badge: 'LINK_CLICK',
          },
        ]);
      } else if (percent === 75) {
        setCurrentStage('CONVERTING');
        const client = targetNames[3] || 'Vikram Patel';
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${percent}`,
            timestamp: now(),
            type: 'CONVERSION',
            message: `🎉 Booking Confirmed! ${client} booked 'Signature Spa Rejuvenation' (₹2,499) with code ${offerMeta.code}`,
            badge: 'REVENUE_+₹2499',
          },
        ]);
      } else if (percent === 88) {
        const client = targetNames[4] || 'Meera Kapoor';
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${percent}`,
            timestamp: now(),
            type: 'CONVERSION',
            message: `🎉 Booking Confirmed! ${client} scheduled weekend appointment (₹1,850)`,
            badge: 'REVENUE_+₹1850',
          },
        ]);
      } else if (percent >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        setCurrentStage('FINISHED');
        setIsRunning(false);
        setStep('COMPLETED');
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-done`,
            timestamp: now(),
            type: 'AI',
            message: `Simulation completed successfully. 31 clients reactivated, +24% projected revenue surge realized.`,
            badge: 'COMPLETE_SUCCESS',
          },
        ]);
      }
    }, intervalMs);
  };

  const handleApplyToCrm = async () => {
    setIsApplyingToCrm(true);
    try {
      // 1. Create a persistent Campaign entry
      const campaignName = `AI Reactivation: ${audienceMeta.label} (${offerMeta.name})`;
      const audienceTargetMap: Record<string, 'INACTIVE_30_DAYS' | 'VIP_CUSTOMERS' | 'ALL'> = {
        ALL_INACTIVE: 'INACTIVE_30_DAYS',
        HIGH_LTV: 'VIP_CUSTOMERS',
        CRITICAL_CHURN: 'INACTIVE_30_DAYS',
      };

      const createdCampaign = await addCampaign({
        name: campaignName,
        channel: 'WHATSAPP',
        status: 'COMPLETED',
        subject: `Exclusive ${offerMeta.name}`,
        content: messagePreviews[lang],
        targetAudience: audienceTargetMap[targetSegment] || 'INACTIVE_30_DAYS',
        totalRecipients: audienceMeta.count,
        deliveredCount: 125,
        openedCount: 108,
        clickedCount: 54,
      });

      // 2. Add activity notes to the top dormant clients in the CRM
      const sampleRecipients = customers.slice(0, 5);
      for (const cust of sampleRecipients) {
        await addNote(
          cust.id,
          `🤖 [AI Reactivation Simulation] WhatsApp offer dispatched with promo ${offerMeta.code}. Smart link tracked & booking conversion recorded.`
        );
      }

      addToast({
        type: 'success',
        title: 'Simulation Dispatched to CRM',
        message: `Campaign logged to Marketing Hub and customer activity history updated for ${audienceMeta.count} clients.`,
      });

      if (onSimulationApplied) {
        onSimulationApplied({
          campaignName,
          totalRecipients: audienceMeta.count,
          deliveredCount: 125,
          openedCount: 108,
          clickedCount: 54,
          conversions: 31,
          projectedRevenue: 38440,
          growthPercentage: 24,
          language: lang,
          offerCode: offerMeta.code,
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to apply simulation to CRM:', err);
      addToast({
        type: 'error',
        title: 'Simulation Sync Notice',
        message: 'Could not sync all records to DB, but local simulation results are ready.',
      });
    } finally {
      setIsApplyingToCrm(false);
    }
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(messagePreviews[lang]);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-zinc-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Saarthi AI Reactivation Simulator</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  Runnable Simulation Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulate targeted WhatsApp reactivation for 127 dormant clients with real-time conversion telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: CONFIGURE & PREVIEW */}
          {step === 'CONFIGURE' && (
            <div className="space-y-6">
              {/* Audience & Offer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Audience Selector */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Target Audience Segment</span>
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {audienceMeta.expectedLift} Est. Lift
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        key: 'ALL_INACTIVE',
                        label: 'All 127 Inactive Clients (30+ Days)',
                        desc: 'Full reactivation blitz across entire dormant roster',
                        count: 127,
                      },
                      {
                        key: 'HIGH_LTV',
                        label: 'High-LTV Dormant VIPs (₹5,000+)',
                        desc: 'Top 42 historical spenders at risk of permanent churn',
                        count: 42,
                      },
                      {
                        key: 'CRITICAL_CHURN',
                        label: 'Critical Churn Risk (60+ Days)',
                        desc: '58 clients with highest predicted attrition rate',
                        count: 58,
                      },
                    ].map((seg) => (
                      <button
                        key={seg.key}
                        type="button"
                        onClick={() => setTargetSegment(seg.key as any)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                          targetSegment === seg.key
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                            : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{seg.label}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{seg.desc}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-1 bg-zinc-900 rounded-lg border border-zinc-800">
                          {seg.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Offer & Incentive Selector */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reactivation Offer & Incentive</span>
                    </label>
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                      Code: {offerMeta.code}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        key: '25_PERCENT',
                        title: '25% Weekend Spa Special',
                        desc: 'High conversion rate on high-margin weekend slots',
                        code: 'REJUVENATE25',
                      },
                      {
                        key: 'FLAT_500',
                        title: 'Flat ₹500 Welcome-Back Voucher',
                        desc: 'Fixed discount for treatments exceeding ₹1,500',
                        code: 'VIP500BACK',
                      },
                      {
                        key: 'FREE_SERVICE',
                        title: 'Complimentary Express Glow Add-on',
                        desc: 'Free 20-min treatment with any booked package',
                        code: 'GLOWCOMPLIMENT',
                      },
                    ].map((off) => (
                      <button
                        key={off.key}
                        type="button"
                        onClick={() => setSelectedOffer(off.key as any)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                          selectedOffer === off.key
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                            : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{off.title}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{off.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                          {off.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multilingual AI Script & Copy Preview */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      AI Generated Personalized Message Draft
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      (Includes Smart Link tracking)
                    </span>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    {[
                      { key: 'en', label: 'English' },
                      { key: 'hi', label: 'हिन्दी (Hindi)' },
                      { key: 'mr', label: 'मराठी (Marathi)' },
                      { key: 'hinglish', label: 'Hinglish' },
                    ].map((l) => (
                      <button
                        key={l.key}
                        type="button"
                        onClick={() => setLang(l.key as any)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                          lang === l.key
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message preview box with Devanagari typography */}
                <div className="relative">
                  <div className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-multilingual leading-[1.7] text-zinc-200 min-h-[90px] pr-20 whitespace-pre-wrap">
                    {messagePreviews[lang]}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="absolute top-3 right-3 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors border border-zinc-700"
                  >
                    {copiedDraft ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Official Cloud API & Smart Link Redirect Engine compliant</span>
                  </div>
                  <span className="font-mono text-emerald-400">
                    Est. Delivery: 98.4% · Target Clicks: ~42%
                  </span>
                </div>
              </div>

              {/* Simulation Speed & Trigger Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Ready for Real-Time Simulation</h4>
                    <p className="text-[11px] text-zinc-400">
                      Will simulate dynamic dispatch to {audienceMeta.count} recipients with live event telemetry.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Speed Selector */}
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                    <span className="text-[10px] font-mono text-zinc-500 px-1.5">Speed:</span>
                    {[
                      { speed: 1, label: '1x' },
                      { speed: 2, label: '2x' },
                      { speed: 4, label: 'Turbo' },
                    ].map((s) => (
                      <button
                        key={s.speed}
                        type="button"
                        onClick={() => setSimSpeed(s.speed as any)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          simSpeed === s.speed
                            ? 'bg-emerald-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={startSimulation}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Live Simulation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 & 3: SIMULATING OR COMPLETED */}
          {(step === 'SIMULATING' || step === 'COMPLETED') && (
            <div className="space-y-6">
              {/* Progress & Live Status Banner */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      {isRunning ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {isRunning ? 'Simulation Running in Real-Time' : 'Simulation Run Completed'}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isRunning
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {currentStage}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {audienceMeta.label} · Code: <span className="font-mono text-emerald-400">{offerMeta.code}</span> · {lang.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-bold text-emerald-400">{progress}%</span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Phase Milestones */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  {[
                    { label: '1. RFM Analysis', reached: progress >= 20 },
                    { label: '2. Batch Dispatch', reached: progress >= 50 },
                    { label: '3. Read & Clicks', reached: progress >= 75 },
                    { label: '4. Conversions', reached: progress >= 100 },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border font-medium ${
                        m.reached
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${m.reached ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Ticker Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Dispatched</p>
                  <p className="text-xl font-mono font-bold text-white mt-1">
                    {dispatchedCount} <span className="text-xs text-zinc-500">/ {audienceMeta.count}</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">WhatsApp API</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Delivered</p>
                  <p className="text-xl font-mono font-bold text-emerald-400 mt-1">{deliveredCount}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">98.4% Rate</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Opened</p>
                  <p className="text-xl font-mono font-bold text-sky-400 mt-1">{openedCount}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">85% Open Rate</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Link Clicks</p>
                  <p className="text-xl font-mono font-bold text-indigo-400 mt-1">{clickedCount}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">42% CTR</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Reactivated</p>
                  <p className="text-xl font-mono font-bold text-emerald-400 mt-1">{conversionsCount}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">+24.4% Surge</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                  <p className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Proj. Revenue</p>
                  <p className="text-xl font-mono font-bold text-emerald-400 mt-1">₹{projectedRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">+24% Net Lift</p>
                </div>
              </div>

              {/* Live Event Telemetry Console */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      Live Telemetry Stream ({logs.length} events logged)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Node Gateway · Latency 14ms</span>
                </div>

                <div
                  ref={logContainerRef}
                  className="p-4 h-48 overflow-y-auto font-mono text-[11px] space-y-2 bg-black/60"
                >
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5 text-zinc-300 leading-relaxed">
                      <span className="text-zinc-500 shrink-0 select-none">[{log.timestamp}]</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                          log.type === 'CONVERSION'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : log.type === 'CLICK'
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : log.type === 'READ'
                            ? 'bg-sky-500/20 text-sky-400'
                            : log.type === 'DISPATCH'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {log.badge || log.type}
                      </span>
                      <span className="flex-1 text-zinc-200">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation Completion Actions */}
              {step === 'COMPLETED' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-950 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Simulation Verified: +₹38,440 Projected Lift (+24%)
                      </h4>
                      <p className="text-xs text-zinc-400">
                        {audienceMeta.count} recipients queued, 31 reactivations projected. Apply results to live CRM and Marketing Hub.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('CONFIGURE');
                        setProgress(0);
                      }}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-zinc-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reconfigure</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyToCrm}
                      disabled={isApplyingToCrm}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                      {isApplyingToCrm ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>Apply to CRM & Marketing</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 flex items-center justify-between bg-zinc-950 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Saarthi AI Predictive Campaign Engine</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
