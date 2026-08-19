'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import {
  IndianRupee,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  Megaphone,
  Globe,
  Activity,
  AlertCircle,
  X,
  CheckSquare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { mockTasks } from '@businessos/database';

export default function BusinessDashboard() {
  const {
    session,
    bookings,
    leads,
    invoices,
    services,
    addCustomer,
    addBooking,
    addCampaign,
    addToast,
  } = useApp();

  const [activeModal, setActiveModal] = useState<'customer' | 'booking' | 'campaign' | 'ask_ai' | null>(null);

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [bookingServiceId, setBookingServiceId] = useState(services[0]?.id || '');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [aiPromptInput, setAiPromptInput] = useState('');

  const recentActivities = [
    {
      id: 'act-1',
      type: 'CUSTOMER_ADDED',
      title: 'New VIP Customer Added',
      description: 'Rahul Sharma (+91 98112 34567) registered.',
      time: '10 mins ago',
      icon: UserPlus,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'act-2',
      type: 'BOOKING_CREATED',
      title: 'Appointment Confirmed',
      description: 'Sarah Miller booked Signature Hydra-Facial for 2:00 PM.',
      time: '32 mins ago',
      icon: Calendar,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400',
    },
    {
      id: 'act-3',
      type: 'AI_ACTION_COMPLETED',
      title: 'AI Tool Execution Completed',
      description: 'Executed GET_INACTIVE_CUSTOMERS intent (14 clients targeted).',
      time: '1 hour ago',
      icon: Sparkles,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'act-4',
      type: 'CAMPAIGN_SENT',
      title: 'WhatsApp Broadcast Sent',
      description: '"Weekend Radiance Flash Sale" delivered to 42 clients.',
      time: '2 hours ago',
      icon: Megaphone,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    },
  ];

  const revenueToday = invoices
    .filter((i) => i.status === 'PAID' && i.createdAt.startsWith('2026-08-11'))
    .reduce((acc, i) => acc + i.total, 0) || 4720;

  const revenueThisMonth = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, i) => acc + i.total, 0) || 84000;

  const previousMonthRevenue = 73500;
  const revenueGrowthPercentage = Math.round(((revenueThisMonth - previousMonthRevenue) / previousMonthRevenue) * 100);

  const newLeadsCount = leads.filter((l) => l.stage === 'NEW').length;
  const qualifiedLeadsCount = leads.filter((l) => l.stage === 'QUALIFIED' || l.stage === 'CONTACTED').length;
  const totalPipelineValue = leads.reduce((acc, l) => acc + l.estimatedValue, 0);

  const todayAppointments = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const upcomingAppointmentsCount = bookings.length;

  const [tasks, setTasks] = useState(mockTasks);
  const pendingTasksCount = tasks.filter((t) => t.status !== 'DONE').length;

  const revenueChartData = [
    { day: 'Mon', revenue: 6200 },
    { day: 'Tue', revenue: 8400 },
    { day: 'Wed', revenue: 7100 },
    { day: 'Thu', revenue: 9800 },
    { day: 'Fri', revenue: 12400 },
    { day: 'Sat', revenue: 15600 },
    { day: 'Sun', revenue: 11200 },
  ];

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' } : t))
    );
    addToast({ type: 'info', title: 'Task Updated', message: 'Task completion status updated.' });
  };

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
            Good morning, {session.organizationName}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 font-sans">
            Here is what needs your attention today. You have <span className="text-white font-bold">{pendingTasksCount} pending tasks</span> and <span className="text-emerald-400 font-bold">{todayAppointments.length} upcoming appointments</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => (window.location.href = '/dashboard/ai')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Saarthi</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Quick Actions</span>
          <span className="text-[10px] text-zinc-400 font-mono">1-Click Execution</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveModal('customer')}
            className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
            <span>Add Customer</span>
          </button>

          <button
            onClick={() => setActiveModal('campaign')}
            className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <span>Create Campaign</span>
          </button>

          <button
            onClick={() => setActiveModal('booking')}
            className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span>Create Booking</span>
          </button>

          <Link
            href="/dashboard/website"
            className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span>Build Website</span>
          </Link>

          <Link
            href="/dashboard/ai"
            className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 transition-all group col-span-2 sm:col-span-1"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Ask AI Workspace</span>
          </Link>
        </div>
      </div>

      {/* CORE METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* REVENUE PULSE */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Revenue Pulse</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs text-zinc-400 font-sans block">Revenue Today: ₹{revenueToday.toLocaleString()}</span>
            <div className="text-metric font-display text-zinc-900 dark:text-white mt-1">
              ₹{revenueThisMonth.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{revenueGrowthPercentage}% vs last month</span>
            </div>
          </div>

          <div className="h-14 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LEADS & PIPELINE */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Leads & Pipeline</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>New Leads: <strong className="text-zinc-900 dark:text-white">{newLeadsCount}</strong></span>
              <span>Qualified: <strong className="text-zinc-900 dark:text-white">{qualifiedLeadsCount}</strong></span>
            </div>
            <div className="text-metric font-display text-zinc-900 dark:text-white mt-1">
              ₹{totalPipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
              Pipeline Conversion: 68%
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span>3 website leads today</span>
            <Link href="/dashboard/customers" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">View CRM</Link>
          </div>
        </div>

        {/* APPOINTMENTS */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Appointments</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-metric font-display text-zinc-900 dark:text-white">
              {todayAppointments.length} <span className="text-sm font-sans font-normal text-zinc-400">Today</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{upcomingAppointmentsCount} total upcoming</p>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">No-Shows Today</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px]">
              0 No-Shows
            </span>
          </div>
        </div>

        {/* OPERATIONAL TASKS */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Operational Tasks</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-metric font-display text-zinc-900 dark:text-white">
              {pendingTasksCount} <span className="text-sm font-sans font-normal text-zinc-400">Pending</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>1 task high priority</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {tasks.slice(0, 2).map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTaskStatus(t.id)}
                className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px] flex items-center justify-between cursor-pointer border border-zinc-100 dark:border-zinc-700"
              >
                <span className={`truncate max-w-[140px] ${t.status === 'DONE' ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200 font-medium'}`}>
                  {t.title}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Recent Platform Activity Feed</h3>
            <p className="text-xs text-zinc-400">Live operational timeline across multi-tenant services</p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Real-time Stream</span>
        </div>

        <div className="space-y-3">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{act.title}</h4>
                    <span className="text-[10px] text-zinc-400 font-mono">{act.time}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{act.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
