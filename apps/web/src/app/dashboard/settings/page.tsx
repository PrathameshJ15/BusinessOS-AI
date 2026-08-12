'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Settings as SettingsIcon,
  Building2,
  ShieldCheck,
  CreditCard,
  Key,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  RefreshCw,
  Sparkles,
  DollarSign,
  Download,
} from 'lucide-react';
import { ROLE_PERMISSIONS } from '@businessos/auth';
import { mockBusinessProfile, mockIntegrations, mockSubscription } from '@businessos/database';

export default function SettingsPage() {
  const { session, invoices, canAccess, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'rbac' | 'integrations' | 'billing'>('profile');

  // Business Profile Form State
  const [businessName, setBusinessName] = useState(session.organizationName);
  const [tagline, setTagline] = useState(mockBusinessProfile.tagline);
  const [address, setAddress] = useState(mockBusinessProfile.address);
  const [phone, setPhone] = useState(mockBusinessProfile.phone);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({ type: 'success', title: 'Settings Saved', message: 'Updated business profile and operating hours.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Settings & Security</h1>
        <p className="text-xs text-slate-500 mt-1">Configure business profile, RBAC permissions, third-party integrations, and Razorpay billing.</p>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-wrap gap-2">
        {[
          { id: 'profile', label: 'Business Profile', icon: Building2 },
          { id: 'rbac', label: 'Role Permissions (RBAC)', icon: ShieldCheck },
          { id: 'integrations', label: 'Integrations & API Keys', icon: Key },
          { id: 'billing', label: 'Billing & Razorpay Invoices', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Business Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle max-w-3xl space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Organization Profile Details</h3>
            <p className="text-xs text-slate-500">Public profile details displayed across client invoices and booking confirmation emails.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Industry Type</label>
                <select className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="SALON">Salon & Spa Aesthetics</option>
                  <option value="CLINIC">Medical Clinic</option>
                  <option value="RESTAURANT">Restaurant & Bistro</option>
                  <option value="GYM">Fitness & Gym Center</option>
                  <option value="REAL_ESTATE">Real Estate Agency</option>
                  <option value="AGENCY">Marketing Agency</option>
                  <option value="CONSULTANT">Consultant / Coach</option>
                  <option value="REPAIR">Repair Services</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {canAccess('settings:write') ? (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  Save Business Profile
                </button>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Restricted Access: Only Organization Owners can edit profile settings.</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* RBAC Role Permissions Tab */}
      {activeTab === 'rbac' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Multi-Tenant RBAC Permissions Matrix</h3>
            <p className="text-xs text-slate-500">Security authorization controls enforced across API routes and AI tool actions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(['OWNER', 'MANAGER', 'STAFF'] as const).map((role) => (
              <div key={role} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900 uppercase">{role} ROLE</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {ROLE_PERMISSIONS[role].length} Permissions
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {ROLE_PERMISSIONS[role].map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono">{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Connected Third-Party Integrations</h3>
            <p className="text-xs text-slate-500">API adapters running in production and development sandbox mode.</p>
          </div>

          <div className="space-y-3">
            {mockIntegrations.map((int) => (
              <div key={int.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {int.provider.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{int.provider.replace(/_/g, ' ')}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Status: {int.status}</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  Connected (Sandbox Mode)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing & Invoices Tab */}
      {activeTab === 'billing' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subscription & Razorpay Invoices</h3>
              <p className="text-xs text-slate-500">Active Plan: <span className="font-bold text-blue-600">BusinessOS PRO (₹2,999/mo)</span></p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              Subscription Active
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase">Customer Invoices Issued</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{inv.invoiceNumber}</span>
                    <p className="text-xs text-slate-500">{inv.customerName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-bold text-slate-900">₹{inv.total.toLocaleString()}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
