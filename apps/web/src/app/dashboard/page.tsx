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
    t,
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

  const handleToggleTask = async (task: any) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    setDbStats((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t: any) => (t.id === task.id ? { ...t, status: nextStatus } : t)),
        pendingTasksCount:
          nextStatus === 'DONE'
            ? Math.max(0, (prev.pendingTasksCount || 1) - 1)
            : (prev.pendingTasksCount || 0) + 1,
      };
    });

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: nextStatus === 'DONE' ? 'Task Completed' : 'Task Reopened',
          message: `Updated task status in Neon DB.`,
        });
      }
    } catch {
      await fetchDashboardStats();
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
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Command Center Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl text-white border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-mono font-bold border border-emerald-500/30 uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('dashboard.commandCenter', 'AI BUSINESS COMMAND CENTER')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-extrabold tracking-tight">
            Welcome back, {session.userName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans break-all sm:break-normal">
            {t('nav.accountContext', 'Connected Account')}: <span className="text-white font-mono font-bold">{session.userEmail}</span> · {t('nav.activeRole', 'Role')}: <span className="text-emerald-400 font-mono font-bold">{session.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => (window.location.href = '/dashboard/ai')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t('dashboard.aiAssistant', 'Ask Saarthi AI')}</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 px-1">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">{t('dashboard.quickActions', 'Quick Actions')}</span>
          <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">Real-time DB Execution</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={() => setActiveModal('customer')}
            className="p-2.5 sm:p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1 sm:mb-1.5" />
            <p className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white truncate">{t('dashboard.addCustomer', 'Add Customer')}</p>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">Save to Neon DB</p>
          </button>
          <button
            onClick={() => setActiveModal('booking')}
            className="p-2.5 sm:p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-1 sm:mb-1.5" />
            <p className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white truncate">{t('dashboard.newBooking', 'Schedule Appointment')}</p>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">Add to roster</p>
          </button>
          <button
            onClick={() => setActiveModal('campaign')}
            className="p-2.5 sm:p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1 sm:mb-1.5" />
            <p className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white truncate">{t('dashboard.launchCampaign', 'Dispatch Campaign')}</p>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">Broadcast offer</p>
          </button>
          <button
            onClick={() => (window.location.href = '/dashboard/ai')}
            className="p-2.5 sm:p-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1 sm:mb-1.5" />
            <p className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white truncate">{t('nav.aiWorkspace', 'AI Workspace')}</p>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">Persisted history</p>
          </button>
        </div>
      </div>

      {/* METRICS STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">{t('dashboard.activeCustomers', 'Total Customers')}</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-zinc-900 dark:text-white">
            {totalCustomers}
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono truncate">Neon PostgreSQL count</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">{t('dashboard.todaysPriorities', 'Active Tasks')}</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-teal-500/10 text-teal-500 shrink-0">
              <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-zinc-900 dark:text-white">
            {activeProjects}
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono truncate">{pendingTasksCount} pending items</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">{t('dashboard.totalBookings', 'Appointments')}</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-zinc-900 dark:text-white">
            {todayAppointmentsCount}
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono truncate">Scheduled in roster</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">{t('dashboard.aiWorkflows', 'AI Requests')}</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-zinc-900 dark:text-white">
            {aiRequestsToday}
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono truncate">AIUsage table log</p>
        </div>
      </div>

      {/* RECENT ACTIVITY & TASKS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white font-display">{t('dashboard.recentActivity', 'Recent Activity Log')}</h3>
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">Database audit stream</span>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">{t('dashboard.noActivityYet', 'No data available yet.')}</p>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {recentActivities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {act.role === 'user' ? 'U' : 'स'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-white truncate">{act.title}</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] line-clamp-2">{act.description}</p>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white font-display">{t('dashboard.todaysPriorities', 'Active Operations & Tasks')}</h3>
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">{tasks.length} Total</span>
          </div>

          {tasks.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">{t('dashboard.noActivityYet', 'No data available yet.')}</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((t: any) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t)}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${t.status === 'DONE' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                    <span className={`font-medium truncate ${t.status === 'DONE' ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 uppercase shrink-0">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{t('dashboard.createCustomerModalTitle', 'Add New Customer')}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">{t('dashboard.customerName', 'Full Name')}</label>
                <input
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder={t('dashboard.customerNamePlaceholder', 'e.g. Ramesh Kumar')}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">{t('dashboard.email', 'Email')}</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder={t('dashboard.emailPlaceholder', 'e.g. ramesh@example.com')}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">{t('dashboard.phone', 'Phone Number')}</label>
                <input
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder={t('dashboard.phonePlaceholder', 'e.g. +91 98000 12345')}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">{t('dashboard.cancel', 'Cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? t('dashboard.saving', 'Saving...') : t('dashboard.createCustomer', 'Save to Neon DB')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'booking' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{t('dashboard.newBookingModalTitle', 'Schedule Appointment')}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">{t('dashboard.bookingCustomerName', 'Customer Name')}</label>
                <input
                  required
                  value={bookingCustName}
                  onChange={(e) => setBookingCustName(e.target.value)}
                  placeholder="e.g. Neha Gupta"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">{t('dashboard.selectService', 'Select Service')}</label>
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
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">{t('dashboard.cancel', 'Cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? t('dashboard.saving', 'Saving...') : t('dashboard.confirmBooking', 'Confirm Appointment')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'campaign' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{t('dashboard.launchCampaignModalTitle', 'Dispatch Marketing Campaign')}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">{t('dashboard.campaignTitle', 'Campaign Title')}</label>
                <input
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder={t('dashboard.campaignTitlePlaceholder', 'e.g. Weekend Flash Offer')}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">{t('dashboard.campaignContent', 'Message Content')}</label>
                <textarea
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  placeholder={t('dashboard.campaignContentPlaceholder', 'Write promotional broadcast copy...')}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 h-24 resize-none"
                />
              </div>
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">{t('dashboard.cancel', 'Cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? t('dashboard.saving', 'Sending...') : t('dashboard.sendCampaign', 'Dispatch Broadcast')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
