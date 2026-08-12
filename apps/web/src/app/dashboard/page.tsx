'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import {
  IndianRupee,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Megaphone,
  Globe,
  UserPlus,
  Bot,
  Activity,
  Filter,
  Layers,
  ChevronRight,
  CheckSquare,
  AlertTriangle,
  X,
  CreditCard,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockTasks } from '@businessos/database';

export default function BusinessDashboard() {
  const {
    session,
    customers,
    bookings,
    campaigns,
    reviews,
    leads,
    invoices,
    services,
    addCustomer,
    addBooking,
    addCampaign,
    createInvoice,
    addToast,
    canAccess,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState<'customer' | 'booking' | 'campaign' | 'ask_ai' | null>(null);

  // Modal Form Inputs
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [bookingServiceId, setBookingServiceId] = useState(services[0]?.id || '');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [aiPromptInput, setAiPromptInput] = useState('');

  // Timeline Activity Feed Data
  const recentActivities = [
    {
      id: 'act-1',
      type: 'CUSTOMER_ADDED',
      title: 'New VIP Customer Added',
      description: 'Rahul Sharma (+91 98112 34567) registered.',
      time: '10 mins ago',
      icon: UserPlus,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'act-2',
      type: 'BOOKING_CREATED',
      title: 'Appointment Confirmed',
      description: 'Sarah Miller booked Signature Hydra-Facial for 2:00 PM.',
      time: '32 mins ago',
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'act-3',
      type: 'AI_ACTION_COMPLETED',
      title: 'AI Tool Execution Completed',
      description: 'Executed GET_INACTIVE_CUSTOMERS intent (14 clients targeted).',
      time: '1 hour ago',
      icon: Sparkles,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'act-4',
      type: 'CAMPAIGN_SENT',
      title: 'WhatsApp Broadcast Sent',
      description: '"Weekend Radiance Flash Sale" delivered to 42 clients.',
      time: '2 hours ago',
      icon: Megaphone,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'act-5',
      type: 'REVIEW_RECEIVED',
      title: 'Google Review Received',
      description: 'Aarav Desai posted a 5-star rating with positive sentiment.',
      time: '4 hours ago',
      icon: Activity,
      color: 'text-sky-600 bg-sky-50',
    },
  ];

  // Calculated Business Command Metrics
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
  const conversionRate = 68;

  const todayAppointments = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const upcomingAppointmentsCount = bookings.length;
  const noShowCount = 0;

  const [tasks, setTasks] = useState(mockTasks);
  const pendingTasksCount = tasks.filter((t) => t.status !== 'DONE').length;
  const overdueTasksCount = 1;

  const revenueChartData = [
    { day: 'Mon', revenue: 6200 },
    { day: 'Tue', revenue: 8400 },
    { day: 'Wed', revenue: 7100 },
    { day: 'Thu', revenue: 9800 },
    { day: 'Fri', revenue: 12400 },
    { day: 'Sat', revenue: 15600 },
    { day: 'Sun', revenue: 11200 },
  ];

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModal === 'customer') {
      if (!custName || !custPhone) return;
      addCustomer({ name: custName, phone: custPhone, tags: ['New Client'] });
      setCustName('');
      setCustPhone('');
    } else if (activeModal === 'booking') {
      const srv = services.find((s) => s.id === bookingServiceId) || services[0];
      addBooking({ serviceId: srv.id, serviceName: srv.name, totalAmount: srv.price });
    } else if (activeModal === 'campaign') {
      if (!campaignTitle) return;
      addCampaign({ name: campaignTitle, channel: 'WHATSAPP' });
      setCampaignTitle('');
    } else if (activeModal === 'ask_ai') {
      window.location.href = '/dashboard/ai';
    }
    setActiveModal(null);
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' } : t))
    );
    addToast({ type: 'info', title: 'Task Updated', message: 'Task completion status updated.' });
  };

  return (
    <div className="space-y-8">
      {/* Command Center Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Business Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Good morning, {session.organizationName}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Here's what needs your attention today. You have <span className="text-white font-bold">{pendingTasksCount} pending tasks</span> and <span className="text-emerald-400 font-bold">{todayAppointments.length} upcoming appointments</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setActiveModal('ask_ai')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Actions</span>
          <span className="text-[11px] text-slate-400 font-mono">1-Click Execution</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveModal('customer')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
            <span>Add Customer</span>
          </button>

          <button
            onClick={() => setActiveModal('campaign')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <span>Create Campaign</span>
          </button>

          <button
            onClick={() => setActiveModal('booking')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span>Create Booking</span>
          </button>

          <Link
            href="/dashboard/website"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span>Build Website</span>
          </Link>

          <Link
            href="/dashboard/ai"
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all group col-span-2 sm:col-span-1"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Ask AI Workspace</span>
          </Link>
        </div>
      </div>

      {/* AI RECOMMENDATIONS (PREMIUM AI INSIGHT PANEL) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold tracking-tight">AI Executive Action Recommendations</h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
            2 Insights Generated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Customer Retention Insight</span>
              </div>
              <p className="text-xs text-slate-200 font-semibold">"14 customers haven't returned in 30+ days."</p>
              <p className="text-[11px] text-slate-400 mt-1">Re-engaging this segment is projected to recover ₹12,500 in revenue this week.</p>
            </div>
            <button
              onClick={() => setActiveModal('campaign')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5"
            >
              <span>Create Campaign</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Booking Performance Growth</span>
              </div>
              <p className="text-xs text-slate-200 font-semibold">"Your bookings are 18% higher than last month."</p>
              <p className="text-[11px] text-slate-400 mt-1">Hydra-Facial & Glow Therapy is your top-performing service (+24%).</p>
            </div>
            <Link
              href="/dashboard/bookings"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Insights</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* CORE STATS GRID: REVENUE, LEADS, APPOINTMENTS, TASKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* REVENUE SECTION */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Revenue Pulse</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Revenue Today: <strong className="text-slate-900">₹{revenueToday.toLocaleString()}</strong></p>
            <div className="text-2xl font-bold text-slate-900 mt-1">₹{revenueThisMonth.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{revenueGrowthPercentage}% vs last month</span>
            </div>
          </div>

          <div className="h-16 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LEADS SECTION */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Leads & Pipeline</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>New Leads: <strong>{newLeadsCount}</strong></span>
              <span>Qualified: <strong>{qualifiedLeadsCount}</strong></span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">₹{totalPipelineValue.toLocaleString()}</div>
            <p className="text-xs text-blue-600 font-semibold mt-1">Pipeline Conversion: {conversionRate}%</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>3 website leads today</span>
            <Link href="/dashboard/customers" className="text-blue-600 font-bold hover:underline">View CRM</Link>
          </div>
        </div>

        {/* APPOINTMENTS SECTION */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Appointments</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{todayAppointments.length} Today</div>
            <p className="text-xs text-slate-500 mt-1">{upcomingAppointmentsCount} total upcoming</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">No-Shows Today</span>
            <span className="font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px]">
              0 No-Shows
            </span>
          </div>
        </div>

        {/* TASKS SECTION */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Operational Tasks</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{pendingTasksCount} Pending</div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{overdueTasksCount} task high priority</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {tasks.slice(0, 2).map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTaskStatus(t.id)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] flex items-center justify-between cursor-pointer border border-slate-100"
              >
                <span className={`truncate max-w-[140px] ${t.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                  {t.title}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Platform Activity Feed</h3>
            <p className="text-xs text-slate-500">Live operational timeline across multi-tenant services</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time Stream</span>
        </div>

        <div className="space-y-4">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DIALOG CONTAINER */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {activeModal === 'customer'
                  ? 'Add New Customer'
                  : activeModal === 'booking'
                  ? 'Create Booking'
                  : activeModal === 'campaign'
                  ? 'Create Campaign'
                  : 'Ask AI Command'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {activeModal === 'customer' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </>
              )}

              {activeModal === 'booking' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Service</label>
                  <select
                    value={bookingServiceId}
                    onChange={(e) => setBookingServiceId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeModal === 'campaign' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Inactive Client Re-engagement Promo"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}

              {activeModal === 'ask_ai' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type AI Command</label>
                  <input
                    type="text"
                    placeholder="e.g. Build my website or Show inactive customers"
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow"
                >
                  Confirm & Execute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
