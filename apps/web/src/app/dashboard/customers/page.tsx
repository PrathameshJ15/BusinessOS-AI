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
} from 'lucide-react';
import { mockStaff } from '@businessos/database';

export default function CustomerWorkspacePage() {
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

  // Selection Checkbox Handler
  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCustomerIds.length === filteredCustomers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map((c) => c.id));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    addCustomer({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      tags: [newTag],
      status: newTag === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
      lifetimeValue: 2500,
    });

    setIsAddCustomerOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId || !newNoteInput.trim()) return;
    addNote(activeProfileId, newNoteInput);
    setNewNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unified Customer Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-tenant CRM, deal stage pipeline, timeline activity, and AI churn intelligence.</p>
        </div>

        <div className="flex items-center gap-3">
          {canAccess('customers:write') ? (
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-mono px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
              Role: Restricted (Read Only)
            </span>
          )}
        </div>
      </div>

      {/* AI Intelligence Shortcuts */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white">AI Customer Intelligence</span>
            <p className="text-[11px] text-slate-400">Ask AI to query churn risk, dormant accounts, or high-value leads.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            'Find customers who haven\'t purchased in 90 days',
            'Show my hottest leads',
            'Which customers are most likely to churn?',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => (window.location.href = `/dashboard/ai`)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `All (${customers.length + leads.length})` },
            { id: 'customers', label: `Customers (${customers.length})` },
            { id: 'leads', label: `Leads (${leads.length})` },
            { id: 'pipeline', label: 'Visual CRM Pipeline' },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => setActiveNav(nav.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeNav === nav.id
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="ltv">Sort by LTV (Highest)</option>
            <option value="activity">Sort by Recent Activity</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar when checkboxes selected */}
      {selectedCustomerIds.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <span className="font-bold">{selectedCustomerIds.length} Clients Selected</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => bulkSendCampaign(selectedCustomerIds)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] transition-colors shadow"
            >
              Send Bulk Offer Campaign
            </button>
            <button
              onClick={() => {
                addToast({ type: 'info', title: 'Export Generated', message: 'Exported selected records to CSV.' });
                setSelectedCustomerIds([]);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-[11px] border border-slate-200"
            >
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* VISUAL CRM PIPELINE VIEW */}
      {activeNav === 'pipeline' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'].map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage);
            return (
              <div key={stage} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{stage}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {stageLeads.map((l) => (
                    <div key={l.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{l.name}</span>
                        <span className="text-xs font-extrabold text-emerald-600">₹{l.estimatedValue.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{l.notes || 'Website lead'}</p>

                      {/* Stage Move Controls */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400">{l.source}</span>
                        <select
                          value={l.stage}
                          onChange={(e) => updateLeadStage(l.id, e.target.value)}
                          className="text-[9px] bg-white border border-slate-200 rounded px-1 py-0.5 focus:outline-none font-bold"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="PROPOSAL">PROPOSAL</option>
                          <option value="WON">WON</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CUSTOMER DATA TABLE */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                      {selectedCustomerIds.length === filteredCustomers.length && filteredCustomers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Phone / Email</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4">Lifetime Value</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCustomers.map((c) => {
                  const isSelected = selectedCustomerIds.includes(c.id);
                  const assignedStaff = mockStaff[0];

                  return (
                    <tr key={c.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-3.5 px-4">
                        <button onClick={() => toggleSelectCustomer(c.id)} className="text-slate-400 hover:text-slate-600">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.name}</p>
                            <span className="text-[10px] text-slate-400">{c.totalBookings} Bookings</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.status === 'VIP'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : c.status === 'INACTIVE'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-800 font-medium">{c.phone}</p>
                        <p className="text-[10px] text-slate-400">{c.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(c.lastActivityAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">₹{c.lifetimeValue.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <img src={assignedStaff.avatarUrl} className="w-5 h-5 rounded-full object-cover" alt="" />
                          <span>{assignedStaff.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveProfileId(c.id)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors text-xs"
                        >
                          View Profile
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

      {/* DETAILED CUSTOMER PROFILE WORKSPACE DRAWER */}
      {selectedProfileCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    {selectedProfileCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedProfileCustomer.name}</h2>
                    <p className="text-xs text-slate-500">{selectedProfileCustomer.email} • {selectedProfileCustomer.phone}</p>
                  </div>
                </div>

                <button onClick={() => setActiveProfileId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Primary Action Button Grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  onClick={() => addBooking({ customerId: selectedProfileCustomer.id, customerName: selectedProfileCustomer.name })}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Create Booking</span>
                </button>

                <button
                  onClick={() => createInvoice(selectedProfileCustomer.name, 1500)}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Create Invoice</span>
                </button>

                <button
                  onClick={() => {
                    addToast({ type: 'info', title: 'SMS Dispatched', message: `Message sent to ${selectedProfileCustomer.phone}` });
                  }}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>Send Message</span>
                </button>
              </div>

              {/* Profile Workspace Nav Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 mb-5 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'activity', label: 'Activity Timeline' },
                  { id: 'notes', label: `Notes (${customerNotes.length})` },
                  { id: 'conversations', label: 'Messages' },
                  { id: 'bookings', label: `Bookings (${customerBookings.length})` },
                  { id: 'invoices', label: `Invoices (${customerInvoices.length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setProfileTab(t.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                      profileTab === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENTS */}
              {profileTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Lifetime Value</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">₹{selectedProfileCustomer.lifetimeValue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Total Bookings</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{selectedProfileCustomer.totalBookings}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Tags & Customer Segmentation</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProfileCustomer.tags.map((t) => (
                        <span key={t} className="px-2.5 py-0.5 text-xs font-medium bg-white border border-slate-200 rounded-md text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Add an internal note about client preferences or sensitivities..."
                      value={newNoteInput}
                      onChange={(e) => setNewNoteInput(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold">
                      Save Note
                    </button>
                  </form>

                  <div className="space-y-2">
                    {customerNotes.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span className="font-bold text-slate-800">{n.authorName}</span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileTab === 'activity' && (
                <div className="space-y-3">
                  {customerActivities.map((act) => (
                    <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-blue-600">{act.title}</span>
                        <span className="text-slate-400">{new Date(act.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700">{act.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-mono">Organization Tenant Isolated Record</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Customer Profile</h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Tag</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="VIP">VIP Client</option>
                  <option value="Regular">Regular Client</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
