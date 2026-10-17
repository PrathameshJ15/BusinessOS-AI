'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Star,
  Clock,
  IndianRupee,
  Phone,
  Mail,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Send,
  X,
  Plus,
  ArrowUpDown,
  CheckSquare,
  Square,
  MessageSquare,
  FileText,
  Calendar,
  CreditCard,
  Sparkles,
  Bot,
  Activity,
  UserCheck,
  Briefcase,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import { mockStaff } from '@businessos/database';
import { WhatsAppDraftModal } from '@/components/WhatsAppDraftModal';
import { PaymentLinkModal } from '@/components/PaymentLinkModal';
import { AIReactivationModal, SimulationResult } from '@/components/AIReactivationModal';

export default function CustomerWorkspacePage() {
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{ name: string; phone: string }>({ name: '', phone: '' });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCustomerData, setPaymentCustomerData] = useState<{ name: string; phone: string; amount: number } | null>(null);
  const [isReactivationModalOpen, setIsReactivationModalOpen] = useState(false);
  const [lastSimulation, setLastSimulation] = useState<SimulationResult | null>(null);

  const {
    customers,
    leads,
    notes,
    activities,
    conversations,
    bookings,
    invoices,
    addCustomer,
    addNote,
    updateLeadStage,
    createInvoice,
    addBooking,
    bulkSendCampaign,
    canAccess,
    addToast,
    t,
  } = useApp();

  const [activeNav, setActiveNav] = useState<'all' | 'customers' | 'leads' | 'pipeline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'ltv' | 'activity' | 'name'>('ltv');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Profile Drawer Tab
  const [profileTab, setProfileTab] = useState<'overview' | 'activity' | 'notes' | 'conversations' | 'bookings' | 'invoices'>('overview');
  const [newNoteInput, setNewNoteInput] = useState('');

  // Add Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTag, setNewTag] = useState('VIP');

  // Filter & Sort Logic
  const filteredCustomers = customers
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);

      if (activeNav === 'customers') {
        if (statusFilter === 'ALL') return matchesSearch;
        return matchesSearch && c.status === statusFilter;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'ltv') return b.lifetimeValue - a.lifetimeValue;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

  const selectedProfileCustomer = customers.find((c) => c.id === activeProfileId);
  const customerNotes = notes.filter((n) => n.customerId === activeProfileId);
  const customerActivities = activities.filter((a) => a.customerId === activeProfileId);
  const customerBookings = bookings.filter((b) => b.customerId === activeProfileId);
  const customerInvoices = invoices.filter((i) => i.customerName === selectedProfileCustomer?.name);

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomerIds.length === filteredCustomers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map((c) => c.id));
    }
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    setIsSubmittingCustomer(true);
    try {
      await addCustomer({
        name: newName,
        phone: newPhone,
        email: newEmail || 'client@example.com',
        tags: [newTag],
      });

      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setIsAddCustomerOpen(false);
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId || !newNoteInput) return;
    addNote(activeProfileId, newNoteInput);
    setNewNoteInput('');
  };

  const handleBulkAction = () => {
    if (selectedCustomerIds.length === 0) return;
    bulkSendCampaign(selectedCustomerIds);
    setSelectedCustomerIds([]);
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-white">
            {t('customers.crmTitle', 'Customer Relationship CRM')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('customers.crmDesc', 'Single source of truth for client records, lead pipelines, activity histories, and AI engagement.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('customers:write') && (
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('customers.addCustomer', 'Add New Client')}</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Intelligence Smart Alert */}
      <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Saarthi Customer Retention Insight</span>
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                {lastSimulation ? 'Simulation Active' : 'AI Active'}
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lastSimulation ? (
                <span>
                  Last simulation executed: <strong className="text-emerald-400 font-mono">{lastSimulation.deliveredCount}</strong> dispatched · <strong className="text-emerald-400 font-mono">{lastSimulation.conversions}</strong> reactivated (+₹{lastSimulation.projectedRevenue.toLocaleString()} surge).
                </span>
              ) : (
                'Identified 127 clients inactive for 30+ days. Predicted 24% revenue surge if WhatsApp reactivation offer is dispatched today.'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsReactivationModalOpen(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5 group"
        >
          <Bot className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          <span>{lastSimulation ? 'Rerun AI Reactivation' : 'Launch AI Reactivation'}</span>
        </button>
      </div>

      {/* Main CRM Workspace Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Database & Pipeline Tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Workspace Filter & Search Controls */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Navigation Segment Control */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                {(['all', 'customers', 'leads', 'pipeline'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveNav(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                      activeNav === tab
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'all'
                      ? t('customers.allNav', 'All Contacts')
                      : tab === 'customers'
                      ? t('customers.customersNav', 'Customers')
                      : tab === 'leads'
                      ? t('customers.leadsNav', 'Leads')
                      : t('customers.pipelineNav', 'Pipeline')}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                >
                  <option value="ltv">{t('customers.sortByLtv', 'Sort by Lifetime Value')}</option>
                  <option value="name">{t('customers.sortByName', 'Sort by Client Name')}</option>
                  <option value="activity">{t('customers.sortByActivity', 'Sort by Recent Activity')}</option>
                </select>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={t('customers.searchPlaceholder', 'Search customers by name, phone or email...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Bulk Selection Banner */}
          {selectedCustomerIds.length > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
              <span className="font-bold">{selectedCustomerIds.length} Clients Selected</span>
              <button
                onClick={() => {
                  const firstSelected = customers.find((c) => selectedCustomerIds.includes(c.id));
                  if (firstSelected) {
                    setWhatsAppModalData({
                      name: `${firstSelected.name} (${selectedCustomerIds.length} selected)`,
                      phone: firstSelected.phone,
                    });
                    setIsWhatsAppModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-bold text-[11px] transition-colors shadow flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send WhatsApp Offer</span>
              </button>
            </div>
          )}

          {/* Contact Table / Pipeline View */}
          {activeNav === 'pipeline' ? (
            /* Visual Lead Kanban Pipeline */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['NEW', 'QUALIFIED', 'WON'] as const).map((stage) => {
                const stageLeads = leads.filter((l) => l.stage === stage);
                return (
                  <div key={stage} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase">{stage} STAGE</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {stageLeads.map((l) => (
                        <div key={l.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/40 transition-all space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">{l.name}</span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-display">₹{l.estimatedValue}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{l.phone}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700 text-[10px]">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-400 font-mono">{l.source}</span>
                              {l.phone && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setWhatsAppModalData({ name: l.name, phone: l.phone });
                                    setIsWhatsAppModalOpen(true);
                                  }}
                                  className="text-[#25D366] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Chat</span>
                                </button>
                              )}
                            </div>
                            {stage === 'NEW' && (
                              <button onClick={() => updateLeadStage(l.id, 'QUALIFIED')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                                Qualify →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Listing View */
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50">
                      <th className="py-3 px-4 w-10">
                        <button onClick={handleSelectAll} className="flex items-center">
                          {selectedCustomerIds.length === filteredCustomers.length && filteredCustomers.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-400" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-4">Client Record</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Lifetime Value</th>
                      <th className="py-3 px-4">Total Bookings</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredCustomers.map((c) => {
                      const isSelected = selectedCustomerIds.includes(c.id);
                      return (
                        <tr key={c.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}>
                          <td className="py-3.5 px-4">
                            <button onClick={() => toggleSelectCustomer(c.id)}>
                              {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-zinc-400" />}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 cursor-pointer" onClick={() => setActiveProfileId(c.id)}>
                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                              <span>{c.name}</span>
                              {c.tags.includes('VIP') && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold">VIP</span>}
                            </div>
                            <span className="text-[10px] text-zinc-400 block">{c.phone} · {c.email}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-display">₹{c.lifetimeValue.toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-mono font-medium">{c.totalBookings} visits</td>
                          <td className="py-3.5 px-4 text-right">
                            <button onClick={() => setActiveProfileId(c.id)} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                              View 360° Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 360° Customer Profile Inspector Drawer */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 flex flex-col justify-between">
          {selectedProfileCustomer ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                    {selectedProfileCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">{selectedProfileCustomer.name}</h3>
                    <p className="text-xs text-zinc-400">{selectedProfileCustomer.email}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{selectedProfileCustomer.phone}</p>
                  </div>
                </div>
                <button onClick={() => setActiveProfileId(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => addBooking({ customerId: selectedProfileCustomer.id, customerName: selectedProfileCustomer.name, customerPhone: selectedProfileCustomer.phone })}
                  className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Book Slot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentCustomerData({
                      name: selectedProfileCustomer.name,
                      phone: selectedProfileCustomer.phone,
                      amount: 2500,
                    });
                    setIsPaymentModalOpen(true);
                  }}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-emerald-500/50"
                  title="Generate Razorpay Payment Link"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Payment Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppModalData({
                      name: selectedProfileCustomer.name,
                      phone: selectedProfileCustomer.phone,
                    });
                    setIsWhatsAppModalOpen(true);
                  }}
                  className="p-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Tabs for Drawer */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-x-auto text-xs">
                {(['overview', 'activity', 'notes', 'invoices'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProfileTab(tab)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                      profileTab === tab ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Drawer Content Views */}
              {profileTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono">Lifetime Value</span>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display mt-0.5">₹{selectedProfileCustomer.lifetimeValue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono">Total Bookings</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">{selectedProfileCustomer.totalBookings} Completed</p>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'notes' && (
                <div className="space-y-3">
                  <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Add staff note to client profile..."
                      value={newNoteInput}
                      onChange={(e) => setNewNoteInput(e.target.value)}
                      className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button type="submit" className="w-full py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg text-xs font-bold">
                      Save Note
                    </button>
                  </form>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {customerNotes.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
                        <p className="text-zinc-800 dark:text-zinc-200 font-medium">{n.content}</p>
                        <span className="text-[9px] text-zinc-400 font-mono mt-1 block">By {n.authorName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileTab === 'activity' && (
                <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                  {customerActivities.map((act) => (
                    <div key={act.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-0.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{act.title}</span>
                      <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">{act.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No Client Selected</h4>
              <p className="text-xs text-zinc-400">Click on any client record in the repository table to inspect 360° profile metrics, notes, and activity timeline.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Register New Client Record</h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Client Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. Vikram Singh"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number (+91)</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="+91 98000 11223"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Client Classification Tag</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="VIP">VIP Client</option>
                  <option value="New Client">New Client</option>
                  <option value="Regular">Regular Member</option>
                  <option value="Corporate">Corporate Account</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCustomer}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow flex items-center gap-1.5"
                >
                  {isSubmittingCustomer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmittingCustomer ? 'Saving Record...' : 'Save Record to Neon DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Direct Chat & AI Draft Modal */}
      <WhatsAppDraftModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        recipientName={whatsAppModalData.name}
        recipientPhone={whatsAppModalData.phone}
        onTrackClick={() => {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'WHATSAPP_CLICK',
              referrerHost: typeof window !== 'undefined' ? window.location.hostname : '',
            }),
          }).catch(() => {});
        }}
      />

      {/* Razorpay Payment Link & Simulation Modal */}
      <PaymentLinkModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentCustomerData(null);
        }}
        customerName={paymentCustomerData?.name}
        customerPhone={paymentCustomerData?.phone}
        amount={paymentCustomerData?.amount}
        serviceName="Retainer Consultation / Salon Service"
      />

      {/* Saarthi AI Reactivation Simulation Modal */}
      <AIReactivationModal
        isOpen={isReactivationModalOpen}
        onClose={() => setIsReactivationModalOpen(false)}
        onSimulationApplied={(result) => setLastSimulation(result)}
      />
    </div>
  );
}
