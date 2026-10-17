'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Instagram,
  MessageSquare,
  Globe,
  Share2,
  Heart,
  Bookmark,
  MousePointerClick,
  CalendarCheck,
  Zap,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  SlidersHorizontal,
  DollarSign,
  Send,
  Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export interface AISocialSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'INSTAGRAM' | 'WHATSAPP' | 'GOOGLE_POST';
  topic: string;
  initialContent: string;
  smartLinkSlug?: string;
  onSimulationApplied?: (result: SocialSimulationResult) => void;
}

export interface SocialSimulationResult {
  platform: 'INSTAGRAM' | 'WHATSAPP' | 'GOOGLE_POST';
  topic: string;
  impressions: number;
  engagement: number;
  linkClicks: number;
  conversions: number;
  projectedRevenue: number;
  roiMultiplier: string;
  smartLinkUrl: string;
}

interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'ALGO' | 'IMPRESSION' | 'LIKE' | 'CLICK' | 'DM' | 'CONVERSION';
  message: string;
  badge?: string;
}

export function AISocialSimulationModal({
  isOpen,
  onClose,
  platform,
  topic,
  initialContent,
  smartLinkSlug,
  onSimulationApplied,
}: AISocialSimulationModalProps) {
  const { addCampaign, addToast } = useApp();

  const [activePlatform, setActivePlatform] = useState<'INSTAGRAM' | 'WHATSAPP' | 'GOOGLE_POST'>(platform);
  const [activeTopic, setActiveTopic] = useState(topic || 'Weekend Rejuvenation Special');
  const [postCaption, setPostCaption] = useState(initialContent || '');
  const [step, setStep] = useState<'SETUP' | 'SIMULATING' | 'COMPLETED'>('SETUP');
  const [reachTier, setReachTier] = useState<'ORGANIC' | 'LOCAL_VIRAL' | 'BOOSTED'>('LOCAL_VIRAL');
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(2);
  const [copiedPost, setCopiedPost] = useState(false);

  // Simulation Running State
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0 - 100
  const [currentPhase, setCurrentPhase] = useState<'INDEXING' | 'REACH' | 'ENGAGEMENT' | 'CONVERTING' | 'COMPLETE'>('INDEXING');
  const [impressions, setImpressions] = useState(0);
  const [reactions, setReactions] = useState(0);
  const [commentsDMs, setCommentsDMs] = useState(0);
  const [linkClicks, setLinkClicks] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [projectedRevenue, setProjectedRevenue] = useState(0);
  const [logs, setLogs] = useState<TelemetryEvent[]>([]);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial content if props change
  useEffect(() => {
    setActivePlatform(platform);
    setActiveTopic(topic || 'Weekend Rejuvenation Special');
    setPostCaption(initialContent || '');
  }, [platform, topic, initialContent]);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const tierMeta = {
    ORGANIC: {
      reach: 1850,
      label: 'Organic Follower Reach',
      desc: 'Standard feed distribution to existing local followers',
      budget: '₹0 (Free)',
      ctr: '3.4%',
    },
    LOCAL_VIRAL: {
      reach: 4200,
      label: 'Local Community Algorithm Surge',
      desc: 'Explore page & local hashtags indexing in your city',
      budget: '₹0 (Optimized AI Hook)',
      ctr: '4.6%',
    },
    BOOSTED: {
      reach: 9800,
      label: 'AI Targeted Micro-Boost',
      desc: 'Sponsored geo-radius ad targeting salon & spa lovers within 7km',
      budget: '₹500 Ad Budget',
      ctr: '5.8%',
    },
  }[reachTier];

  const defaultSmartLink = smartLinkSlug
    ? `https://luminaluxe.businessos.in/go/${smartLinkSlug}`
    : 'https://luminaluxe.businessos.in/go/social-special';

  const startSimulation = () => {
    setStep('SIMULATING');
    setIsRunning(true);
    setProgress(0);
    setCurrentPhase('INDEXING');
    setImpressions(0);
    setReactions(0);
    setCommentsDMs(0);
    setLinkClicks(0);
    setConversions(0);
    setProjectedRevenue(0);

    const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });
    const targetImpressions = tierMeta.reach;

    const initialLogs: TelemetryEvent[] = [
      {
        id: '1',
        timestamp: now(),
        type: 'ALGO',
        message: `Indexed post on ${activePlatform} algorithm. Content scored 92/100 on hook engagement.`,
        badge: 'HOOK_SCORE_92',
      },
      {
        id: '2',
        timestamp: now(),
        type: 'ALGO',
        message: `Smart link active: ${defaultSmartLink} (attributing direct bookings).`,
        badge: 'LINK_TRACKING',
      },
    ];
    setLogs(initialLogs);

    let curr = 0;
    const intervalMs = Math.max(70, Math.floor(160 / simSpeed));

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      curr += 1;
      setProgress(curr);

      const targetImp = Math.min(targetImpressions, Math.round((curr / 100) * targetImpressions));
      const targetReact = Math.round(targetImp * 0.125);
      const targetComments = Math.round(targetImp * 0.018);
      const targetClicks = Math.round(targetImp * 0.044);
      const targetConv = Math.round(targetClicks * 0.155);
      const targetRev = targetConv * 1650;

      setImpressions(targetImp);
      setReactions(targetReact);
      setCommentsDMs(targetComments);
      setLinkClicks(targetClicks);
      setConversions(targetConv);
      setProjectedRevenue(targetRev);

      if (curr === 15) {
        setCurrentPhase('REACH');
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-15`,
            timestamp: now(),
            type: 'IMPRESSION',
            message: `Reach expanding rapidly across local search & hashtag feeds (+850 impressions)...`,
            badge: 'REACH_EXPANDING',
          },
        ]);
      } else if (curr === 35) {
        setCurrentPhase('ENGAGEMENT');
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-35`,
            timestamp: now(),
            type: 'LIKE',
            message: `❤️ @ananya_wellness and 48 others liked your ${activePlatform} post.`,
            badge: 'VIRAL_SURGE',
          },
        ]);
      } else if (curr === 55) {
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-55`,
            timestamp: now(),
            type: 'CLICK',
            message: `🔗 High-intent click: User tapped ${defaultSmartLink} from post caption!`,
            badge: 'SMART_CLICK',
          },
        ]);
      } else if (curr === 70) {
        setCurrentPhase('CONVERTING');
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-70`,
            timestamp: now(),
            type: 'DM',
            message: `💬 Inbound Inquiry: @kavita_m asked: "Are weekend slots open for this package?"`,
            badge: 'NEW_LEAD',
          },
        ]);
      } else if (curr === 85) {
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-85`,
            timestamp: now(),
            type: 'CONVERSION',
            message: `🎉 Booking Confirmed! Sunita Rao booked service via Smart Link (+₹2,200)!`,
            badge: 'BOOKING_+₹2200',
          },
        ]);
      } else if (curr >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        setCurrentPhase('COMPLETE');
        setIsRunning(false);
        setStep('COMPLETED');
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-done`,
            timestamp: now(),
            type: 'CONVERSION',
            message: `Simulation Completed! Total conversions: ${targetConv} bookings, Projected Revenue: ₹${targetRev.toLocaleString()}!`,
            badge: 'SIMULATION_SUCCESS',
          },
        ]);
      }
    }, intervalMs);
  };

  const handleApplyToMarketing = async () => {
    setIsSavingCampaign(true);
    try {
      const channelName = activePlatform === 'INSTAGRAM' ? 'INSTAGRAM' : activePlatform === 'WHATSAPP' ? 'WHATSAPP' : 'GOOGLE';
      const created = await addCampaign({
        name: `Social Post: ${activeTopic}`,
        channel: channelName as any,
        status: 'COMPLETED',
        subject: `Social Promotion - ${activePlatform}`,
        content: postCaption,
        targetAudience: 'ALL',
        totalRecipients: impressions,
        deliveredCount: impressions,
        openedCount: reactions,
        clickedCount: linkClicks,
      });

      addToast({
        type: 'success',
        title: 'Campaign Saved to Hub',
        message: `Registered "${created.name}" with ${linkClicks} tracked clicks and ${conversions} simulated bookings.`,
      });

      if (onSimulationApplied) {
        onSimulationApplied({
          platform: activePlatform,
          topic: activeTopic,
          impressions,
          engagement: reactions,
          linkClicks,
          conversions,
          projectedRevenue,
          roiMultiplier: reachTier === 'BOOSTED' ? '49.3x' : 'Infinite (Organic)',
          smartLinkUrl: defaultSmartLink,
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to log social campaign:', err);
      addToast({
        type: 'error',
        title: 'Campaign Log Notice',
        message: 'Could not sync campaign to DB, but local simulation results are ready.',
      });
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(`${postCaption}\n\n👉 Book your session here: ${defaultSmartLink}`);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">AI Social Campaign & Reach Simulator</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  Real-Time Engagement Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulate audience impressions, algorithm traction, click-through rates, and booking conversion ROI.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: SETUP & CHANNEL MOCKUP */}
          {step === 'SETUP' && (
            <div className="space-y-6">
              {/* Channel Selector & Target Tier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Channel Selector */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-pink-400" />
                      <span>Social Platform Format</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">{activePlatform}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
                      { key: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400' },
                      { key: 'GOOGLE_POST', label: 'Google Post', icon: Globe, color: 'text-blue-400' },
                    ].map((p) => {
                      const Icon = p.icon;
                      const isSelected = activePlatform === p.key;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setActivePlatform(p.key as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-pink-500/10 border-pink-500/50 text-white'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? p.color : 'text-zinc-400'}`} />
                          <span className="text-xs font-bold">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reach & Distribution Strategy */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Audience Reach Strategy</span>
                    </label>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Est. CTR: {tierMeta.ctr}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'ORGANIC', label: 'Organic Local Reach (~1,850 views)', meta: '₹0 · Existing Followers' },
                      { key: 'LOCAL_VIRAL', label: 'Local Community Viral Surge (~4,200 views)', meta: '₹0 · High Algorithm Hook' },
                      { key: 'BOOSTED', label: 'AI Geo-Targeted Boost (~9,800 views)', meta: '₹500 · 7km Radius Ads' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setReachTier(t.key as any)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          reachTier === t.key
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{t.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{t.meta}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                          {t.key === reachTier ? 'Selected' : 'Pick'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Realistic Platform Mock Preview */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-pink-400" />
                    <span>Realistic {activePlatform} Post Preview</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors border border-zinc-700"
                  >
                    {copiedPost ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPost ? 'Copied' : 'Copy Caption & Link'}</span>
                  </button>
                </div>

                {/* Mock Card Preview */}
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-xl mx-auto space-y-3 shadow-lg">
                  {/* Account Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 p-0.5 flex items-center justify-center">
                        <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center font-bold text-[10px] text-white">
                          LL
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white">luminaluxespa</span>
                          <span className="w-3 h-3 rounded-full bg-sky-500 text-[8px] flex items-center justify-center text-white">✓</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">Banjara Hills, Hyderabad · Sponsored</span>
                      </div>
                    </div>
                    <span className="text-zinc-500 font-mono text-xs">•••</span>
                  </div>

                  {/* Caption with Devanagari typography */}
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs font-multilingual leading-[1.65] text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {postCaption || `✨ ${activeTopic} ✨\n\nExperience pure relaxation with our signature treatments. Reserve your spot today!`}
                    <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                      <span>🔗 Tracked Smart Link: /go/social-special</span>
                      <span className="text-zinc-500">Tap to test</span>
                    </div>
                  </div>

                  {/* Engagement Bar */}
                  <div className="flex items-center justify-between pt-1 text-zinc-400 text-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 hover:text-pink-400 cursor-pointer">
                        <Heart className="w-4 h-4" /> 428
                      </span>
                      <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                        <MessageSquare className="w-4 h-4" /> 38
                      </span>
                      <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                        <Send className="w-4 h-4" /> 24
                      </span>
                    </div>
                    <Bookmark className="w-4 h-4 hover:text-amber-400 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Ready to Simulate Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/30 via-zinc-900 to-zinc-950 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/40">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Ready to Run Social Campaign Simulation</h4>
                    <p className="text-[11px] text-zinc-400">
                      Will simulate dynamic algorithm response across {tierMeta.reach.toLocaleString()} targeted viewers with live conversions.
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
                            ? 'bg-pink-600 text-white'
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
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-950/40 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Social Simulation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 & 3: SIMULATION RUNNING OR COMPLETED */}
          {(step === 'SIMULATING' || step === 'COMPLETED') && (
            <div className="space-y-6">
              {/* Progress & Live Status Banner */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                      {isRunning ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {isRunning ? 'Social Simulation In Progress' : 'Social Reach Simulation Completed'}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isRunning
                              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {currentPhase}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Platform: <span className="font-mono text-pink-400">{activePlatform}</span> · Topic: "{activeTopic}" · {tierMeta.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-bold text-pink-400">{progress}%</span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400 h-2.5 rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Phase Milestones */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  {[
                    { label: '1. Algorithm Index', reached: progress >= 20 },
                    { label: '2. Feed Impressions', reached: progress >= 50 },
                    { label: '3. Bio Clicks & DMs', reached: progress >= 75 },
                    { label: '4. Direct Bookings', reached: progress >= 100 },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border font-medium ${
                        m.reached
                          ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${m.reached ? 'text-pink-400' : 'text-zinc-600'}`} />
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Ticker Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Impressions</p>
                  <p className="text-xl font-mono font-bold text-white mt-1">
                    {impressions.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Local Viewers</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Reactions & Likes</p>
                  <p className="text-xl font-mono font-bold text-pink-400 mt-1">{reactions}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">12.5% Rate</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Comments & DMs</p>
                  <p className="text-xl font-mono font-bold text-purple-400 mt-1">{commentsDMs}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">High Intent</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Smart Clicks</p>
                  <p className="text-xl font-mono font-bold text-indigo-400 mt-1">{linkClicks}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{tierMeta.ctr} CTR</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Bookings Made</p>
                  <p className="text-xl font-mono font-bold text-emerald-400 mt-1">{conversions}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">+15.5% Conversion</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                  <p className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Projected Rev</p>
                  <p className="text-xl font-mono font-bold text-emerald-400 mt-1">₹{projectedRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">ROAS 49.3x</p>
                </div>
              </div>

              {/* Live Event Telemetry Console */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      Social Algorithm Telemetry Stream ({logs.length} events)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Node API Router · Latency 11ms</span>
                </div>

                <div
                  ref={logRef}
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
                            : log.type === 'DM'
                            ? 'bg-purple-500/20 text-purple-400'
                            : log.type === 'LIKE'
                            ? 'bg-pink-500/20 text-pink-400'
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

              {/* Completion Action Bar */}
              {step === 'COMPLETED' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-950 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Performance Verified: ₹{projectedRevenue.toLocaleString()} Revenue Surge Projected!
                      </h4>
                      <p className="text-xs text-zinc-400">
                        {impressions.toLocaleString()} reach, {linkClicks} smart link clicks, {conversions} appointments converted.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('SETUP');
                        setProgress(0);
                      }}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-zinc-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-simulate</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyToMarketing}
                      disabled={isSavingCampaign}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                      {isSavingCampaign ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>Log Campaign in Hub</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 flex items-center justify-between bg-zinc-950 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>Saarthi AI Social Reach & Conversion Simulator</span>
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
