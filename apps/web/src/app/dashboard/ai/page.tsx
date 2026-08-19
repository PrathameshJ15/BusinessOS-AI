'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { createAIService, AIProvider } from '@businessos/ai';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  ArrowRight,
  RefreshCw,
  Terminal,
  Lock,
  MessageSquare,
  History,
  Activity,
  AlertTriangle,
  X,
  Check,
  Building2,
  Database,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  progressStep?: string;
  actionRequested?: {
    toolName: string;
    intent: string;
    parameters: Record<string, any>;
    requiredPermission: string;
    isWriteAction?: boolean;
    executionResult?: any;
    status: 'COMPLETED' | 'PENDING_APPROVAL' | 'DENIED_PERMISSIONS';
  };
  suggestedPrompts?: string[];
}

export default function AIWorkspacePage() {
  const { session, customers, bookings, invoices, website, addToast } = useApp();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<string | null>(null);

  const [threads] = useState([
    { id: 'th-1', title: 'Daily Executive Pulse', time: '10 mins ago', active: true },
    { id: 'th-2', title: 'Inactive Client Re-engagement', time: '2 hours ago', active: false },
    { id: 'th-3', title: 'Website Builder Generation', time: 'Yesterday', active: false },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'USER',
      content: 'Good morning Saarthi! What is our current revenue pulse and how can we boost weekend bookings?',
    },
    {
      id: 'm-2',
      sender: 'AI',
      content:
        'Good morning! I analyzed your workspace data. Revenue today stands at ₹4,720 across 3 appointments. However, your weekend slot occupancy is down 14%.\n\nI identified 127 dormant clients who haven\'t visited in 30+ days. Recommended Action: Launch an automated WhatsApp 20% discount campaign.',
      actionRequested: {
        toolName: 'execute_marketing_campaign',
        intent: 'CREATE_WHATSAPP_BROADCAST',
        parameters: { targetCount: 127, offer: '20% Off Weekend Spa', promoCode: 'GLOW20' },
        requiredPermission: 'marketing:write',
        isWriteAction: true,
        status: 'COMPLETED',
        executionResult: { delivered: 127, status: 'Broadcast Dispatched Successfully' },
      },
      suggestedPrompts: [
        'How many new leads came in today?',
        'Draft an Instagram post for our hair spa package',
        'Show client lifetime value leaderboard',
      ],
    },
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: `m-${Date.now()}`, sender: 'USER', content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setPromptInput('');

    setIsLoading(true);
    setCurrentProgress('Analyzing business context & domain data...');

    setTimeout(() => {
      setCurrentProgress('Orchestrating tool execution pipeline...');
    }, 600);

    setTimeout(() => {
      const aiService = createAIService(selectedProvider);
      let aiResponseContent = '';
      let action: ChatMessage['actionRequested'] = undefined;

      const lower = query.toLowerCase();
      if (lower.includes('lead') || lower.includes('customer')) {
        aiResponseContent = `Analyzed CRM database. You currently have ${customers.length} total client records. Top VIP customer is Ramesh Kumar (LTV: ₹8,400).`;
      } else if (lower.includes('book') || lower.includes('appointment')) {
        aiResponseContent = `You have ${bookings.length} upcoming appointments scheduled on the roster. 0 no-shows recorded today.`;
      } else if (lower.includes('sales') || lower.includes('revenue') || lower.includes('invoice')) {
        aiResponseContent = `Total sales logged this month across Razorpay invoices: ₹84,000 (+14% month-over-month growth).`;
      } else {
        aiResponseContent = `Hello! I am your Saarthi AI co-pilot for ${session.organizationName}. How can I help automate your business operations today?`;
      }

      const aiMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: 'AI',
        content: aiResponseContent,
        suggestedPrompts: [
          'Show me all active WhatsApp campaigns',
          'Create a booking for tomorrow 3 PM',
          'Publish website updates',
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      setCurrentProgress(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Saarthi AI Business Workspace</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Multi-Model AI
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Autonomous business co-pilot that executes tool calls across your CRM, bookings, marketing, and invoices.</p>
        </div>

        {/* AI Provider Switcher */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs">
          <span className="text-[11px] font-mono text-zinc-400 px-2 font-bold uppercase">Provider:</span>
          {(['openai', 'gemini', 'anthropic'] as AIProvider[]).map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedProvider(prov)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition-all ${
                selectedProvider === prov
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Threads History */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Active Threads</span>
            </h3>
          </div>

          <div className="space-y-1.5">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-xl text-xs cursor-pointer transition-all border ${
                  t.active
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-zinc-900 dark:text-white font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <p className="truncate">{t.title}</p>
                <span className="text-[9px] font-mono text-zinc-400 mt-1 block">{t.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Main Chat Thread & Interaction Console */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between min-h-[550px] overflow-hidden">
          {/* Thread Header */}
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Saarthi Execution Engine</h3>
                <p className="text-[10px] text-zinc-400 font-mono">Role Access: {session.role} · Multi-Tenant Context Loaded</p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ready for Queries</span>
            </span>
          </div>

          {/* Messages Feed Container */}
          <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[420px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'AI' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    स
                  </div>
                )}

                <div className={`max-w-xl space-y-3 ${msg.sender === 'USER' ? 'bg-emerald-600 text-white p-4 rounded-2xl text-xs font-medium shadow' : 'bg-zinc-50 dark:bg-zinc-800/80 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Tool Execution Card if requested */}
                  {msg.actionRequested && (
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Tool Action Executed: {msg.actionRequested.toolName}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[9px]">
                          {msg.actionRequested.status}
                        </span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">Permission: <span className="text-emerald-600 dark:text-emerald-400">{msg.actionRequested.requiredPermission}</span></p>
                    </div>
                  )}

                  {/* Suggested Quick Follow-Up Prompts */}
                  {msg.suggestedPrompts && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(p)}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{p}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'USER' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    AV
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 animate-pulse">
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{currentProgress || 'Saarthi AI processing...'}</span>
              </div>
            )}
          </div>

          {/* Prompt Input Form Bar */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500/60 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask Saarthi to execute business actions in natural language... (e.g. 'Show me top clients')"
                className="flex-1 text-xs bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none font-sans font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !promptInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow shrink-0 flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
