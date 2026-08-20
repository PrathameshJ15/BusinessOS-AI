'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  History,
  Bookmark,
  Settings,
  ChevronLeft,
  Menu,
  Loader2,
  Lightbulb,
  TrendingUp,
  Users,
  BarChart3,
  FileText,
  Mail,
  Search,
  Globe,
  Package,
  Target,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Quick Actions ───────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Marketing Ideas', icon: Lightbulb, prompt: 'Give me 10 creative marketing ideas for my business that I can implement this week with minimal budget.' },
  { label: 'Social Post', icon: Globe, prompt: 'Generate an engaging social media post for my business that drives engagement and attracts new followers.' },
  { label: 'Sales Strategy', icon: TrendingUp, prompt: 'Create a practical sales strategy to increase my revenue by 20% over the next quarter.' },
  { label: 'Customer Analysis', icon: Users, prompt: 'Help me analyze my customer base. What segments should I focus on and how can I increase retention?' },
  { label: 'Business Summary', icon: BarChart3, prompt: 'Generate a concise weekly business summary template that tracks the most important KPIs.' },
  { label: 'Website Copy', icon: FileText, prompt: 'Write compelling website homepage copy for my business that converts visitors into customers.' },
  { label: 'Email Generator', icon: Mail, prompt: 'Draft a professional email campaign to re-engage inactive customers with a special offer.' },
  { label: 'Product Description', icon: Package, prompt: 'Write a persuasive product description that highlights benefits and drives purchase decisions.' },
  { label: 'SEO Ideas', icon: Search, prompt: 'Give me actionable SEO recommendations to improve my website ranking and organic traffic.' },
  { label: 'Competitor Analysis', icon: Target, prompt: 'Help me create a competitor analysis framework to identify market opportunities and threats.' },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AIWorkspacePage() {
  const { session, addToast } = useApp();

  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // UI state
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Fetch Conversations ──────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // Silent fail — conversations will appear empty
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ─── Fetch Messages for Active Conversation ──────────────────────────────

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${activeConversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(
            data.messages?.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
            })) || []
          );
        }
      } catch {
        // Silent fail
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  // ─── Auto-scroll ──────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send Message ─────────────────────────────────────────────────────────

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || promptInput).trim();
    if (!query || isLoading || isStreaming) return;

    if (!textToSend) setPromptInput('');

    // Add user message to UI immediately
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);
    setIsStreaming(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationId: activeConversationId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Something went wrong. Please try again.' }));
        addToast({ type: 'error', title: 'Request Failed', message: err.error || 'Something went wrong. Please try again.' });
        setIsLoading(false);
        return;
      }

      // Process SSE stream
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      let newConversationId: string | null = null;

      // Add empty assistant message for streaming
      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
      ]);

      setIsLoading(false);
      setIsStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'meta' && parsed.conversationId) {
              newConversationId = parsed.conversationId;
              if (!activeConversationId) {
                setActiveConversationId(parsed.conversationId);
              }
            }

            if (parsed.type === 'delta' && parsed.content) {
              assistantContent += parsed.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                )
              );
            }

            if (parsed.type === 'error') {
              addToast({ type: 'error', title: 'Stream Error', message: parsed.error || 'Response was interrupted.' });
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      setIsStreaming(false);

      // Refresh conversation list
      fetchConversations();
    } catch {
      addToast({ type: 'error', title: 'Connection Error', message: 'Something went wrong. Please try again.' });
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // ─── New Chat ─────────────────────────────────────────────────────────────

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setPromptInput('');
    setMobileSidebarOpen(false);
  };

  // ─── Select Conversation ──────────────────────────────────────────────────

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileSidebarOpen(false);
  };

  // ─── Rename Conversation ──────────────────────────────────────────────────

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      const res = await fetch(`/api/conversations/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, title: editTitle.trim() } : c))
        );
      }
    } catch {
      // Silent fail
    }

    setEditingId(null);
    setEditTitle('');
  };

  // ─── Delete Conversation ──────────────────────────────────────────────────

  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
        addToast({ type: 'info', title: 'Conversation Deleted', message: 'Conversation removed successfully.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Delete Failed', message: 'Something went wrong. Please try again.' });
    }
  };

  // ─── Copy Response ────────────────────────────────────────────────────────

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  // ─── Regenerate Response ──────────────────────────────────────────────────

  const handleRegenerate = () => {
    // Find the last user message and resend
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove the last assistant message
      setMessages((prev) => {
        const idx = prev.findLastIndex((m) => m.role === 'assistant');
        if (idx > -1) return [...prev.slice(0, idx)];
        return prev;
      });
      handleSendMessage(lastUserMsg.content);
    }
  };

  // ─── Keyboard Handler ────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ─── Time Formatter ───────────────────────────────────────────────────────

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  // ─── Determine if showing welcome screen ─────────────────────────────────

  const showWelcome = !activeConversationId && messages.length === 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="text-zinc-900 dark:text-zinc-100 font-sans -m-6 md:-m-8 flex h-[calc(100vh-4rem)]">
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3 h-3" />
            <span>Conversations</span>
          </div>

          {conversations.length === 0 && (
            <p className="px-3 py-4 text-xs text-zinc-400 dark:text-zinc-500 text-center">
              No conversations yet
            </p>
          )}

          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                activeConversationId === conv.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-zinc-900 dark:text-white font-bold'
                  : 'bg-transparent border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              {editingId === conv.id ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                    className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <button onClick={handleSaveRename} className="p-1 text-emerald-600 hover:text-emerald-500">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-zinc-400 hover:text-zinc-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <p className="truncate">{conv.title}</p>
                    <span className="text-[9px] font-mono text-zinc-400 mt-0.5 block">
                      {formatTime(conv.updatedAt)}
                    </span>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartRename(conv); }}
                      className="p-1 text-zinc-400 hover:text-zinc-200 rounded"
                      title="Rename"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                      className="p-1 text-zinc-400 hover:text-rose-400 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Prompts</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
            <Settings className="w-3.5 h-3.5" />
            <span>AI Settings</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Chat Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-[#09090b]">
        {/* Chat header */}
        <div className="px-4 md:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Saarthi AI</h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {isStreaming ? 'Generating response...' : 'Your intelligent business copilot'}
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="hidden sm:inline">{isStreaming ? 'Streaming' : 'Ready'}</span>
          </span>
        </div>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">
          {showWelcome ? (
            /* ─── Welcome Screen ─────────────────────────────────────── */
            <div className="h-full flex flex-col items-center justify-center p-6 md:p-12">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/30 mb-6">
                स
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-zinc-900 dark:text-white text-center mb-2">
                Saarthi AI
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-10 max-w-md">
                Your intelligent business copilot. Ask about marketing, sales, customers, strategy — or pick a quick action below.
              </p>

              {/* Quick Actions */}
              <div className="w-full max-w-3xl">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => handleSendMessage(action.prompt)}
                        className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all group"
                      >
                        <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                        <span className="text-center leading-tight">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ─── Messages Feed ──────────────────────────────────────── */
            <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                      स
                    </div>
                  )}

                  <div
                    className={`max-w-2xl ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white p-4 rounded-2xl text-xs font-medium shadow'
                        : 'bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</div>

                    {/* Assistant action buttons */}
                    {msg.role === 'assistant' && msg.content && (
                      <div className="flex items-center gap-1 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Copy"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={handleRegenerate}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1.5 text-zinc-400 hover:text-emerald-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {session.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    स
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                    <span>Saarthi is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ─── Message Composer ───────────────────────────────────────── */}
        <div className="p-3 md:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto flex items-end gap-3 bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500/60 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mb-2" />
            <textarea
              ref={textareaRef}
              value={promptInput}
              onChange={(e) => {
                setPromptInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Saarthi anything about your business..."
              rows={1}
              className="flex-1 text-xs bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none font-sans font-medium resize-none max-h-40 leading-relaxed"
              disabled={isLoading || isStreaming}
            />
            <button
              type="submit"
              disabled={isLoading || isStreaming || !promptInput.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow shrink-0 flex items-center gap-1.5 mb-0.5"
            >
              {isLoading || isStreaming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
          <p className="text-[10px] text-zinc-400 text-center mt-2">
            Press Enter to send · Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
