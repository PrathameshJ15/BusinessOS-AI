'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  Calendar,
  Megaphone,
  CheckCircle2,
  Scissors,
  Stethoscope,
  Utensils,
  Dumbbell,
  Building,
  Briefcase,
  Wrench,
  Bot,
  Terminal,
  Activity,
  Layers,
  Heart,
} from 'lucide-react';

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('Salons');
  const [promptText, setPromptText] = useState('Build a luxury landing page and schedule appointments');

  const businessCategories = [
    { name: 'Salons', icon: Scissors, prompt: 'Build my salon website & automate weekend SMS discounts' },
    { name: 'Clinics', icon: Stethoscope, prompt: 'Schedule patient consultations & send WhatsApp reminders' },
    { name: 'Restaurants', icon: Utensils, prompt: 'Manage table bookings & send promotional coupons' },
    { name: 'Gyms', icon: Dumbbell, prompt: 'Track active memberships & re-engage inactive members' },
    { name: 'Real Estate', icon: Building, prompt: 'Capture buyer leads & generate instant property brochures' },
    { name: 'Agencies', icon: Briefcase, prompt: 'Generate client invoices & manage project retainers' },
    { name: 'Consultants', icon: Users, prompt: 'Automate client onboarding & invoice generation' },
    { name: 'Coaches', icon: Heart, prompt: 'Manage group coaching calls & monthly subscriptions' },
    { name: 'Repair Services', icon: Wrench, prompt: 'Book service calls & automatically request 5-star Google reviews' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Subtle Background Mesh Canvas Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
            B
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            BusinessOS <span className="text-blue-400 font-mono text-sm">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-slate-200 transition-colors">
            Core Modules
          </a>
          <a href="#workflow" className="hover:text-slate-200 transition-colors">
            AI Workflow
          </a>
          <a href="#usecases" className="hover:text-slate-200 transition-colors">
            Industries
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next-Generation AI Business Operating System</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Your business.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-slate-200">
            One intelligent workspace.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          "Ask AI what you want to achieve. BusinessOS AI does the work."
        </p>

        {/* AI Command Input Sandbox */}
        <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-2xl backdrop-blur-xl mb-12">
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">
            <Bot className="w-5 h-5 text-blue-400" />
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
            />
            <Link
              href="/dashboard/ai"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow shrink-0"
            >
              Run Command
            </Link>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 px-2">
            <span>Try: "Show inactive customers" or "Create an invoice for Rahul"</span>
          </div>
        </div>

        {/* Industry Selector Tabs */}
        <div id="usecases" className="pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Tailored For Every Local & Service Business</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {businessCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setPromptText(cat.prompt);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Tool Execution Workflow Section */}
      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 block">Autonomous AI Engine</span>
          <h2 className="text-3xl font-bold text-white tracking-tight">How BusinessOS AI Executes Work</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4 font-bold text-sm">
              01
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Intent Detection</h3>
            <p className="text-xs text-slate-400">Parses natural language requests into structured business commands.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4 font-bold text-sm">
              02
            </div>
            <h3 className="text-sm font-bold text-white mb-1">RBAC Security Guard</h3>
            <p className="text-xs text-slate-400">Enforces organization tenant boundaries & role permission checks.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-4 font-bold text-sm">
              03
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Tool Execution</h3>
            <p className="text-xs text-slate-400">Triggers real actions in website, CRM, bookings, or Razorpay invoicing.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4 font-bold text-sm">
              04
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Audit Logging</h3>
            <p className="text-xs text-slate-400">Logs every executed command with clear security verdicts.</p>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Core Platform Modules</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything your business needs in one unified, multi-tenant operating system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <Sparkles className="w-6 h-6 text-blue-400 mb-4" />
            <h3 className="text-base font-bold text-white mb-2">AI Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified command center connected directly to your business data with OpenAI, Claude, Gemini, and Groq abstraction.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <Users className="w-6 h-6 text-indigo-400 mb-4" />
            <h3 className="text-base font-bold text-white mb-2">Customers & Leads CRM</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track lifetime value, dormant client re-engagement, tags, and sales deal pipelines.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <Globe className="w-6 h-6 text-purple-400 mb-4" />
            <h3 className="text-base font-bold text-white mb-2">AI Website Builder</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly generate, edit, and publish modern responsive websites with custom domain hosting.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center border-t border-slate-900">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to automate your business operations?</h2>
        <p className="text-slate-400 text-sm mb-8">Experience BusinessOS AI with pre-loaded mock data and live AI tools.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-xl shadow-blue-600/30"
        >
          <span>Enter Platform Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 BusinessOS AI. Built with Next.js, NestJS, TypeScript, Tailwind CSS, & Multi-Tenant Neon PostgreSQL.</p>
      </footer>
    </div>
  );
}
