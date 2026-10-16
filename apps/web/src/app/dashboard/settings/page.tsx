'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import {
  Settings as SettingsIcon,
  Building2,
  ShieldCheck,
  CreditCard,
  Key,
  CheckCircle2,
  Lock,
  Loader2,
  User,
  Sparkles,
  Zap,
  Globe,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { ROLE_PERMISSIONS } from '@businessos/auth';
import { buildWhatsAppClickToChat, validateWhatsAppPhone } from '@/lib/whatsapp';

export default function SettingsPage() {
  const {
    session,
    invoices,
    subscription,
    integrations,
    toggleIntegration,
    canAccess,
    addToast,
    updateUserSettings,
    updateBusinessSettings,
    refreshData,
    language,
    setLanguage,
    t,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'account' | 'profile' | 'rbac' | 'integrations' | 'billing'>('account');

  // AI Usage state from Neon
  const [usage, setUsage] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  // User Settings Form State
  const [editUserName, setEditUserName] = useState(session.userName);
  const [editUserEmail, setEditUserEmail] = useState(session.userEmail);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Business Form State
  const [bizId, setBizId] = useState('');
  const [businessName, setBusinessName] = useState(session.organizationName);
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [targetCustomers, setTargetCustomers] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [employeeCount, setEmployeeCount] = useState(5);

  const [loadingBiz, setLoadingBiz] = useState(false);
  const [isSavingBiz, setIsSavingBiz] = useState(false);

  // WhatsApp Configuration State
  const [waPhone, setWaPhone] = useState('+91 98765 43210');
  const [waEnabled, setWaEnabled] = useState(true);
  const [waWelcomeMsg, setWaWelcomeMsg] = useState('Hello! How can we assist you today?');
  const [waCtaLabel, setWaCtaLabel] = useState('Chat on WhatsApp');
  const [waVisitorMsg, setWaVisitorMsg] = useState('Hi! I visited your website and would like to know more about your services.');
  const [loadingWa, setLoadingWa] = useState(false);
  const [isSavingWa, setIsSavingWa] = useState(false);
  const [copiedWaLink, setCopiedWaLink] = useState(false);

  // Keep state in sync with session
  useEffect(() => {
    setEditUserName(session.userName);
    setEditUserEmail(session.userEmail);
    setBusinessName(session.organizationName);
  }, [session.userName, session.userEmail, session.organizationName]);

  useEffect(() => {
    async function fetchUsage() {
      setLoadingUsage(true);
      try {
        const res = await fetch('/api/usage', {
          headers: { 'x-saarthi-user-email': session.userEmail },
        });
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch {
        // Fallback
      } finally {
        setLoadingUsage(false);
      }
    }
    fetchUsage();
  }, [session.userEmail]);

  useEffect(() => {
    async function fetchBusiness() {
      setLoadingBiz(true);
      try {
        const res = await fetch('/api/business', {
          headers: { 'x-saarthi-user-email': session.userEmail },
        });
        if (res.ok) {
          const data = await res.json();
          setBizId(data.id || '');
          setBusinessName(data.name || session.organizationName);
          setIndustry(data.industry || '');
          setDescription(data.description || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setWebsite(data.website || '');
          setAddress(data.address || '');
          setCity(data.city || '');
          setState(data.state || '');
          setTargetCustomers(data.targetCustomers || '');
          setProductsServices(data.productsServices || '');
          setEmployeeCount(data.employeeCount || 5);
        }
      } catch {
        // Fallback
      } finally {
        setLoadingBiz(false);
      }
    }
    if (activeTab === 'profile') {
      fetchBusiness();
    }
  }, [activeTab, session.userEmail, session.organizationName]);

  useEffect(() => {
    async function fetchWhatsApp() {
      setLoadingWa(true);
      try {
        const res = await fetch('/api/whatsapp/settings', {
          headers: { 'x-saarthi-user-email': session.userEmail },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setWaPhone(data.settings.phoneNumber || '+91 98765 43210');
            setWaEnabled(Boolean(data.settings.isEnabled));
            setWaWelcomeMsg(data.settings.defaultWelcomeMessage || 'Hello! How can we assist you today?');
            setWaCtaLabel(data.settings.defaultCtaLabel || 'Chat on WhatsApp');
            setWaVisitorMsg(data.settings.visitorMessage || 'Hi! I visited your website and would like to know more about your services.');
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoadingWa(false);
      }
    }
    if (activeTab === 'integrations') {
      fetchWhatsApp();
    }
  }, [activeTab, session.userEmail]);

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWa(true);
    try {
      const res = await fetch('/api/whatsapp/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({
          phoneNumber: waPhone,
          isEnabled: waEnabled,
          defaultWelcomeMessage: waWelcomeMsg,
          defaultCtaLabel: waCtaLabel,
          visitorMessage: waVisitorMsg,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save WhatsApp settings.');
      }
      addToast({
        type: 'success',
        title: 'WhatsApp Settings Saved',
        message: 'Your business WhatsApp configuration has been updated in Neon database.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Configuration Error',
        message: err.message || 'Failed to update WhatsApp settings.',
      });
    } finally {
      setIsSavingWa(false);
    }
  };

  const handleSaveUserSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserName.trim()) return;

    setIsSavingUser(true);
    try {
      await updateUserSettings({
        name: editUserName.trim(),
        email: editUserEmail.trim(),
      });
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleSaveBusinessProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setIsSavingBiz(true);
    try {
      await updateBusinessSettings({
        name: businessName.trim(),
        industry: industry.trim(),
        description: description.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        targetCustomers: targetCustomers.trim(),
        productsServices: productsServices.trim(),
        employeeCount: Number(employeeCount),
      });
    } finally {
      setIsSavingBiz(false);
    }
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-white">
          {t('settings.settingsTitle', 'Settings & Account Profile')}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {t('settings.settingsDesc', 'Manage user account credentials, Neon database preferences, AI usage tracking, and security roles.')}
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'account', label: t('settings.tabAccount', 'User Account & AI Usage'), icon: User },
          { id: 'profile', label: t('settings.tabProfile', 'Business Profile'), icon: Building2 },
          { id: 'rbac', label: t('settings.tabRbac', 'Role Permissions (RBAC)'), icon: ShieldCheck },
          { id: 'integrations', label: t('settings.tabIntegrations', 'Integrations & API Keys'), icon: Key },
          { id: 'billing', label: t('settings.tabBilling', 'Billing & Invoices'), icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Account & AI Usage Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6 max-w-3xl">
          {/* Language & Localization Settings */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  {t('settings.languageSectionTitle', 'Language & Localization')}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('settings.languageSectionDesc', 'Choose your preferred language across the entire platform')}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      addToast({
                        type: 'success',
                        title: lang.nativeName,
                        message: `Platform language set to ${lang.label} (${lang.nativeName}).`,
                      });
                    }}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-24 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/60 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                        {lang.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-white">{lang.nativeName}</p>
                      <p className="text-[11px] text-zinc-400">{lang.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Profile Form */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">User Profile Settings</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Personal account settings stored in Neon PostgreSQL and synchronized globally across all views.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                USER LEVEL
              </span>
            </div>

            <form onSubmit={handleSaveUserSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">User Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    placeholder="e.g. Prathamesh Jadhav"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">User Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    placeholder="prathamesh@test.com"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 font-mono text-[10px] block mb-1">Active Security Role</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{session.role}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 font-mono text-[10px] block mb-1">Associated Business</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white truncate block">{session.organizationName}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSavingUser ? 'Saving User Settings...' : 'Save User Settings to Neon'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* AI Usage Tracker */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Dynamic AI Usage Metrics</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Real-time usage logged in `AiUsage` table for {session.userName}.</p>
              </div>
            </div>

            {loadingUsage ? (
              <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Loading usage from Neon...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-mono text-[10px] block">Daily Requests</span>
                  <span className="text-2xl font-bold font-display text-zinc-900 dark:text-white">{usage?.dailyRequests ?? 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-mono text-[10px] block">Monthly Requests</span>
                  <span className="text-2xl font-bold font-display text-zinc-900 dark:text-white">{usage?.monthlyRequests ?? 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-mono text-[10px] block">Tokens Consumed</span>
                  <span className="text-2xl font-bold font-display text-zinc-900 dark:text-white">{(usage?.tokensUsed ?? 0).toLocaleString()}</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-mono text-[10px] block">Last AI Request</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {usage?.lastRequestAt ? new Date(usage.lastRequestAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-3xl space-y-6">
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Business Context & Profile Settings</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Stored in Neon PostgreSQL and automatically synchronized across all pages, reports, and Saarthi AI context.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              BUSINESS LEVEL
            </span>
          </div>

          {loadingBiz ? (
            <div className="p-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Loading business profile from Neon...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveBusinessProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Skincare & Wellness"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Business Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Business Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Business Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Target Customers (Used by AI)</label>
                  <input
                    type="text"
                    value={targetCustomers}
                    onChange={(e) => setTargetCustomers(e.target.value)}
                    placeholder="e.g. College students, VIP wellness clients"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Products & Services (Used by AI)</label>
                  <input
                    type="text"
                    value={productsServices}
                    onChange={(e) => setProductsServices(e.target.value)}
                    placeholder="e.g. Hydra-Facials, Massage, Keratin treatment"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {canAccess('settings:write') ? (
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingBiz}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingBiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{isSavingBiz ? 'Saving Business Settings...' : 'Save Business Settings to Neon'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Restricted Access: Only Organization Owners can edit profile settings.</span>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* RBAC Role Permissions Tab */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Multi-Tenant RBAC Permissions Matrix</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Security authorization controls enforced across API routes and AI tool actions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(['OWNER', 'MANAGER', 'STAFF'] as const).map((role) => (
              <div key={role} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase">{role} ROLE</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {ROLE_PERMISSIONS[role].length} Permissions
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {ROLE_PERMISSIONS[role].map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Connected Third-Party Integrations</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">API adapters running in production and development sandbox mode.</p>
          </div>

          <div className="space-y-3">
            {integrations.map((int: any) => (
              <div key={int.id || int.provider} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                    {int.provider.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{int.provider.replace(/_/g, ' ')}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">Status: {int.status}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleIntegration(int.provider)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    int.status === 'CONNECTED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:opacity-80'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:opacity-80'
                  }`}
                >
                  {int.status === 'CONNECTED' ? 'Connected (Sandbox Mode)' : 'Disconnected (Click to Connect)'}
                </button>
              </div>
            ))}
          </div>

          {/* Dedicated Business WhatsApp Configuration */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Business WhatsApp Click-to-Chat Configuration
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Configure your verified business phone number, default customer greetings, and website CTA button.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWaEnabled(!waEnabled)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                  waEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                }`}
              >
                {waEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <form onSubmit={handleSaveWhatsApp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    WhatsApp Phone Number (with Country Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Format: +91 followed by 10 digits. Validated for safe wa.me click-to-chat links.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Website CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={waCtaLabel}
                    onChange={(e) => setWaCtaLabel(e.target.value)}
                    placeholder="Chat on WhatsApp"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Default Website Visitor Message (Prefilled)
                </label>
                <input
                  type="text"
                  value={waVisitorMsg}
                  onChange={(e) => setWaVisitorMsg(e.target.value)}
                  placeholder="Hi! I visited your website and would like to know more about your services."
                  className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Default Customer Welcome Message
                </label>
                <input
                  type="text"
                  value={waWelcomeMsg}
                  onChange={(e) => setWaWelcomeMsg(e.target.value)}
                  placeholder="Hello! How can we assist you today?"
                  className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Real-time Click-to-Chat Preview */}
              <div className="p-4 rounded-xl bg-zinc-950 text-white border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Live Click-to-Chat Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const previewUrl = validateWhatsAppPhone(waPhone).isValid
                          ? buildWhatsAppClickToChat(waPhone, waVisitorMsg)
                          : '';
                        if (previewUrl) {
                          navigator.clipboard.writeText(previewUrl);
                          setCopiedWaLink(true);
                          setTimeout(() => setCopiedWaLink(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedWaLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWaLink ? 'Copied' : 'Copy Link'}</span>
                    </button>

                    {validateWhatsAppPhone(waPhone).isValid && (
                      <a
                        href={buildWhatsAppClickToChat(waPhone, waVisitorMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Test Click</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {waCtaLabel || 'Chat on WhatsApp'}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      "{waVisitorMsg}"
                    </p>
                  </div>
                </div>
              </div>

              {canAccess('settings:write') ? (
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingWa}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingWa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{isSavingWa ? 'Saving WhatsApp Settings...' : 'Save WhatsApp Settings to Neon'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Restricted Access: Only Organization Owners can edit WhatsApp configuration.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Billing & Invoices Tab */}
      {activeTab === 'billing' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Subscription & Invoices</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Active Plan: <span className="font-bold text-emerald-600 dark:text-emerald-400">BusinessOS {subscription?.plan || 'PRO'} (₹{Number(subscription?.amount ?? 2999).toLocaleString()}/mo)</span>
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {subscription?.status === 'ACTIVE' ? 'Subscription Active' : (subscription?.status || 'Subscription Active')}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase">Customer Invoices</h4>
            {invoices.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4">No data available yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">{inv.invoiceNumber}</span>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{inv.customerName}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-bold text-zinc-900 dark:text-white">₹{inv.total.toLocaleString()}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
