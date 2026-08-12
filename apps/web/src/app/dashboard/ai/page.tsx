'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { createAIService } from '@businessos/ai';
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
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  actionResult?: any;
  securityVerdict?: 'ALLOWED' | 'DENIED_PERMISSIONS';
  suggestedPrompts?: string[];
}

export default function AIWorkspacePage() {
  const { session, addToast } = useApp();
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'AI',
      content: `Hello ${session.userName}! I am your BusinessOS AI Assistant. Ask me to perform any action across your website, customer CRM, bookings, marketing campaigns, or invoices.`,
      suggestedPrompts: [
        'Build my website.',
        'Show my inactive customers.',
        'Why are sales down this month?',
        'Create an invoice for Rahul.',
        'Send an offer to inactive customers.',
        'Reply to my latest Google review.',
      ],
    },
  ]);

  const aiService = createAIService('openai');

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

    try {
      const response = await aiService.processUserCommand(commandText, session);

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'AI',
        content: response.message,
        actionResult: response.actionRequested,
        securityVerdict: response.actionRequested?.status === 'DENIED_PERMISSIONS' ? 'DENIED_PERMISSIONS' : 'ALLOWED',
        suggestedPrompts: response.suggestedPrompts,
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (response.actionRequested?.status === 'DENIED_PERMISSIONS') {
        addToast({
          type: 'warning',
          title: 'Permission Denied',
          message: `Role '${session.role}' lacks permission for '${response.actionRequested.requiredPermission}'`,
        });
      } else if (response.actionRequested) {
        addToast({
          type: 'success',
          title: 'AI Action Executed',
          message: `Executed tool '${response.actionRequested.toolName}' successfully.`,
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'AI Service Error', message: 'Failed to process AI command.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white">
      {/* Top AI Engine Status Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>BusinessOS AI Tool Execution Workspace</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Provider: OpenAI GPT-4o Abstraction • Security Context: {session.role} ({session.organizationName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline font-mono">RBAC Guard Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 max-w-3xl ${msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                msg.sender === 'USER'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 text-blue-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'USER' ? 'You' : <Bot className="w-5 h-5" />}
            </div>

            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'USER'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                <p>{msg.content}</p>
              </div>

              {/* Action Execution Result Card */}
              {msg.actionResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
                    msg.securityVerdict === 'DENIED_PERMISSIONS'
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-bold">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      <span>TOOL EXECUTION: {msg.actionResult.toolName}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        msg.securityVerdict === 'DENIED_PERMISSIONS'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {msg.actionResult.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    <p>Intent: <span className="text-white">{msg.actionResult.intent}</span></p>
                    <p>Required Permission: <span className="text-blue-400">{msg.actionResult.requiredPermission}</span></p>
                    {msg.actionResult.executionResult && (
                      <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-400">
                        {JSON.stringify(msg.actionResult.executionResult, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Prompt Pill Suggestions */}
              {msg.suggestedPrompts && (
                <div className="flex flex-wrap gap-2 pt-1">
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
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono animate-pulse">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>AI detecting intent & evaluating RBAC security permissions...</span>
          </div>
        )}
      </div>

      {/* Bottom Input Command Form */}
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
            placeholder="Type your command (e.g. 'Build my website', 'Send offer to inactive clients')..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !promptInput.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow shrink-0 flex items-center gap-1.5"
          >
            <span>Execute</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
