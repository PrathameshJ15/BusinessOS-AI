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

  // Past Conversations List
  const [threads] = useState([
    { id: 'th-1', title: 'Daily Executive Pulse', time: '10 mins ago', active: true },
    { id: 'th-2', title: 'Inactive Client Re-engagement', time: '2 hours ago', active: false },
    { id: 'th-3', title: 'Website Builder Generation', time: 'Yesterday', active: false },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'AI',
      content: `Hello ${session.userName}! I am your BusinessOS AI Command Center. Ask me anything about your business performance, customer CRM, bookings, marketing broadcasts, or invoices.`,
      suggestedPrompts: [
        'How is my business performing?',
        'Show inactive customers.',
        'Why are sales down?',
        'Create a campaign.',
        'Build my website.',
        'Show today\'s appointments.',
        'Find my hottest leads.',
      ],
    },
  ]);

  const handleSendCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'USER',
      content: commandText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsLoading(true);
    setCurrentProgress('Retrieving business context...');

    try {
      const aiService = createAIService(selectedProvider);
      
      // Step Progress simulation
      setTimeout(() => setCurrentProgress('Evaluating RBAC authorization guard...'), 400);
      setTimeout(() => setCurrentProgress('Executing secure AI tool...'), 800);

      const response = await aiService.processUserCommand(commandText, session);

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'AI',
        content: response.message,
        progressStep: response.progressStep,
        actionRequested: response.actionRequested as any,
        suggestedPrompts: response.suggestedPrompts,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (response.actionRequested?.status === 'DENIED_PERMISSIONS') {
        addToast({
          type: 'warning',
          title: 'Permission Denied',
          message: `Role '${session.role}' lacks required permission '${response.actionRequested.requiredPermission}'`,
        });
      } else if (response.actionRequested) {
        addToast({
          type: 'success',
          title: 'AI Action Executed',
          message: `Executed tool '${response.actionRequested.toolName}' via ${selectedProvider.toUpperCase()}.`,
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'AI Provider Error', message: 'Failed to complete AI request.' });
    } finally {
      setIsLoading(false);
      setCurrentProgress(null);
    }
  };

  const handleConfirmAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.actionRequested) {
          return {
            ...msg,
            actionRequested: {
              ...msg.actionRequested,
              status: 'COMPLETED',
            },
          };
        }
        return msg;
      })
    );
    addToast({ type: 'success', title: 'Action Approved & Executed', message: 'Action broadcast completed.' });
  };

  return (
    <div className="h-[calc(100vh-110px)] grid grid-cols-1 lg:grid-cols-12 gap-5 select-none font-sans">
      {/* LEFT PANEL: CONVERSATION THREADS (3 COLS) */}
      <div className="hidden lg:flex lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex-col justify-between text-white shadow-xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <span>AI Sessions History</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
              {threads.length} Threads
            </span>
          </div>

          <div className="space-y-2">
            {threads.map((th) => (
              <div
                key={th.id}
                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                  th.active
                    ? 'bg-blue-600/20 border-blue-500/40 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{th.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{th.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Provider Select Box */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Model Provider</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-xl focus:outline-none font-medium"
          >
            <option value="openai">OpenAI GPT-4o (Default)</option>
            <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
            <option value="gemini">Google Gemini 1.5 Pro</option>
            <option value="groq">Groq Llama 3 70B</option>
          </select>
        </div>
      </div>

      {/* CENTER PANEL: CONVERSATION STREAM & INPUT (6 COLS) */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between text-white shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                <span>BusinessOS AI Command Center</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ONLINE
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">Active Provider: {selectedProvider.toUpperCase()}</p>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
            Role: {session.role}
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  msg.sender === 'USER'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800 text-blue-400 border border-slate-700'
                }`}
              >
                {msg.sender === 'USER' ? 'You' : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-3 flex-1">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
                  }`}
                >
                  <p>{msg.content}</p>
                </div>

                {/* Progress Step Note */}
                {msg.progressStep && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60 w-fit">
                    <Activity className="w-3 h-3 text-blue-400 animate-spin" />
                    <span>{msg.progressStep}</span>
                  </div>
                )}

                {/* ACTION CONFIRMATION / RESULT CARD */}
                {msg.actionRequested && (
                  <div
                    className={`p-4 rounded-2xl border text-xs font-mono space-y-3 ${
                      msg.actionRequested.status === 'DENIED_PERMISSIONS'
                        ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                        : msg.actionRequested.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2 font-bold">
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        <span>TOOL EXECUTION: {msg.actionRequested.toolName}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          msg.actionRequested.status === 'DENIED_PERMISSIONS'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : msg.actionRequested.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {msg.actionRequested.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <p>Intent: <span className="text-white">{msg.actionRequested.intent}</span></p>
                      <p>Permission: <span className="text-blue-400">{msg.actionRequested.requiredPermission}</span></p>
                    </div>

                    {/* CONFIRMATION BUTTONS FOR WRITE ACTIONS */}
                    {msg.actionRequested.status === 'PENDING_APPROVAL' && (
                      <div className="pt-2 border-t border-amber-800/60 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleConfirmAction(msg.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Execute Action</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* SUGGESTED PROMPTS */}
                {msg.suggestedPrompts && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedPrompts.map((promptText) => (
                      <button
                        key={promptText}
                        onClick={() => handleSendCommand(promptText)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>{promptText}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono animate-pulse bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>{currentProgress || 'Processing request via AI provider...'}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCommand(promptInput);
            }}
            className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 focus-within:border-blue-500/60 transition-all"
          >
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <input
              type="text"
              placeholder="Ask BusinessOS anything..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !promptInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow shrink-0 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL: BUSINESS CONTEXT & RECENT AUDIT LOG (3 COLS) */}
      <div className="hidden lg:flex lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex-col justify-between text-white shadow-xl">
        <div className="space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Retrieved Business Context</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Organization Profile</span>
              <p className="font-bold text-white">{session.organizationName}</p>
              <p className="text-[10px] text-blue-400">Salon & Spa • Pro Plan</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase">Customers</span>
                <p className="font-bold text-white mt-0.5">{customers.length} Active</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase">Bookings</span>
                <p className="font-bold text-white mt-0.5">{bookings.length} Today</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase">Security Audit Log</span>
              <div className="space-y-1 text-[10px] font-mono text-slate-400">
                <div className="flex items-center justify-between text-emerald-400">
                  <span>AI_TOOL_get_bookings</span>
                  <span>ALLOWED</span>
                </div>
                <div className="flex items-center justify-between text-blue-400">
                  <span>AI_TOOL_search_customers</span>
                  <span>ALLOWED</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>RBAC Guard & Security Audit Active</span>
        </div>
      </div>
    </div>
  );
}
