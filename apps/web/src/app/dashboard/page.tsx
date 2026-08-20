'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { PageSkeleton, CardSkeleton, Skeleton } from '../../components/ui';
import {
  IndianRupee,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  UserPlus,
  Megaphone,
  Globe,
  Activity,
  AlertCircle,
  X,
  CheckSquare,
  Loader2,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export default function BusinessDashboard() {
  const {
    session,
    customers,
    bookings,
    services,
    addCustomer,
    addBooking,
    addCampaign,
    addToast,
    refreshData,
  } = useApp();

  const [dbStats, setDbStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeModal, setActiveModal] = useState<'customer' | 'booking' | 'campaign' | null>(null);

  // Form states
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [bookingServiceId, setBookingServiceId] = useState('');
  const [bookingCustName, setBookingCustName] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/dashboard', {
        headers: { 'x-saarthi-user-email': session.userEmail },
      });
      if (res.ok) {
        const data = await res.json();
        setDbStats(data.stats);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [session.userEmail]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;
    setIsSubmitting(true);
    try {
      await addCustomer({ name: custName, email: custEmail || 'client@example.com', phone: custPhone });
      setCustName('');
      setCustEmail('');
      setCustPhone('');
      setActiveModal(null);
      await fetchDashboardStats();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCustName) return;
    setIsSubmitting(true);
    try {
      await addBooking({
        customerName: bookingCustName,
        serviceId: bookingServiceId || services[0]?.id,
      });
      setBookingCustName('');
      setActiveModal(null);
      await fetchDashboardStats();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle) return;
    setIsSubmitting(true);
    try {
      await addCampaign({
        name: campaignTitle,
        content: campaignContent || 'Special promotional offer for valued clients.',
      });
      setCampaignTitle('');
      setCampaignContent('');
      setActiveModal(null);
      await fetchDashboardStats();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStats && !dbStats) {
    return <PageSkeleton />;
  }

  const totalCustomers = dbStats?.totalCustomers ?? customers.length;
  const activeProjects = dbStats?.activeProjects ?? 0;
  const pendingTasksCount = dbStats?.pendingTasksCount ?? 0;
  const todayAppointmentsCount = dbStats?.todayAppointmentsCount ?? bookings.length;
  const revenueThisMonth = dbStats?.revenueThisMonth ?? 0;
  const revenueToday = dbStats?.revenueToday ?? 0;
  const aiRequestsToday = dbStats?.aiRequestsToday ?? 0;
  const monthlyAiRequests = dbStats?.monthlyAiRequests ?? 0;
  const tasks = dbStats?.tasks || [];
  const recentActivities = dbStats?.recentActivities || [];

  return (
    <div className="space-y-8 font-sans">
      {/* Command Center Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-6 md:p-8 rounded-3xl text-white border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI BUSINESS COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-extrabold tracking-tight">
            Welcome back, {session.userName}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 font-sans">
            Connected Account: <span className="text-white font-mono font-bold">{session.userEmail}</span> · Role: <span className="text-emerald-400 font-mono font-bold">{session.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => (window.location.href = '/dashboard/ai')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Saarthi AI</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Quick Actions</span>
          <span className="text-[10px] text-zinc-400 font-mono">Real-time DB Execution</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveModal('customer')}
            className="p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Add Customer</p>
            <p className="text-[10px] text-zinc-400">Save to Neon DB</p>
          </button>
          <button
            onClick={() => setActiveModal('booking')}
            className="p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-1.5" />
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Schedule Appointment</p>
            <p className="text-[10px] text-zinc-400">Add to roster</p>
          </button>
          <button
            onClick={() => setActiveModal('campaign')}
            className="p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1.5" />
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Dispatch Campaign</p>
            <p className="text-[10px] text-zinc-400">Broadcast offer</p>
          </button>
          <button
            onClick={() => (window.location.href = '/dashboard/ai')}
            className="p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
            <p className="text-xs font-bold text-zinc-900 dark:text-white">AI Workspace</p>
            <p className="text-[10px] text-zinc-400">Persisted history</p>
          </button>
        </div>
      </div>

      {/* METRICS STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Customers</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-zinc-900 dark:text-white">
            {totalCustomers}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">Neon PostgreSQL record count</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Tasks</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-zinc-900 dark:text-white">
            {activeProjects}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">{pendingTasksCount} pending action items</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Appointments</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-zinc-900 dark:text-white">
            {todayAppointmentsCount}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">Scheduled in database roster</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">AI Requests</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-zinc-900 dark:text-white">
            {aiRequestsToday}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">Recorded in AIUsage table</p>
        </div>
      </div>

      {/* RECENT ACTIVITY & TASKS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-display">Recent Activity Log</h3>
            <span className="text-[10px] font-mono text-zinc-400">Database audit stream</span>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No data available yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {act.role === 'user' ? 'U' : 'स'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-white">{act.title}</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate">{act.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-display">Active Operations & Tasks</h3>
            <span className="text-[10px] font-mono text-zinc-400">{tasks.length} Total</span>
          </div>

          {tasks.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No data available yet.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${t.status === 'DONE' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                    <span className={`font-medium ${t.status === 'DONE' ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 uppercase">
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── MODALS ───────────────────────────────────────────────────────── */}
      {activeModal === 'customer' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Add New Customer</h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                <input
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                <input
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="e.g. +91 98000 12345"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Saving...' : 'Save to Neon DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'booking' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Schedule Appointment</h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Customer Name</label>
                <input
                  required
                  value={bookingCustName}
                  onChange={(e) => setBookingCustName(e.target.value)}
                  placeholder="e.g. Neha Gupta"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Select Service</label>
                <select
                  value={bookingServiceId}
                  onChange={(e) => setBookingServiceId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Saving...' : 'Confirm Appointment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'campaign' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Dispatch Marketing Campaign</h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Campaign Title</label>
                <input
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Weekend Flash Offer"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Message Content</label>
                <textarea
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  placeholder="Write promotional broadcast copy..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 h-24 resize-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50 flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Sending...' : 'Dispatch Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
