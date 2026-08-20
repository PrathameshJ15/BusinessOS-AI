'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Briefcase,
  Target,
  Package,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const { session, refreshData, addToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('SALON');
  const [industry, setIndustry] = useState('Wellness & Skincare');
  const [description, setDescription] = useState('');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');

  const [employeeCount, setEmployeeCount] = useState<number>(5);
  const [businessStage, setBusinessStage] = useState('GROWTH');
  const [targetCustomers, setTargetCustomers] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check if onboarding is already completed
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/onboarding', {
          headers: { 'x-saarthi-user-email': session.userEmail },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.onboardingCompleted && data.business) {
            router.push('/dashboard');
            return;
          }
        }
      } catch {
        // Continue to onboarding
      } finally {
        setIsCheckingStatus(false);
      }
    }
    checkStatus();
  }, [session.userEmail, router]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Business Name is required.');
        return;
      }
      setErrorMsg('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Business Name is required.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({
          name: name.trim(),
          type,
          industry: industry.trim(),
          description: description.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website: website.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          employeeCount: Number(employeeCount),
          businessStage,
          targetCustomers: targetCustomers.trim(),
          productsServices: productsServices.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to save onboarding details.');
        setIsSubmitting(false);
        return;
      }

      addToast({
        type: 'success',
        title: 'Business Setup Complete',
        message: `${name} has been configured. Welcome to Saarthi AI!`,
      });

      await refreshData();
      router.push('/dashboard');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          <span>Verifying business context...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans grid-pattern flex flex-col justify-between p-6">
      {/* Brand Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/30">
            स
          </div>
          <div>
            <h1 className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              SAARTHI <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-sans font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">AI</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono">Business Setup & Onboarding</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">{session.userEmail}</span>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-2xl mx-auto w-full my-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              Step {step} of 3
            </span>
            <h2 className="text-xl font-bold font-display text-white">
              {step === 1 && 'Basic Business Information'}
              {step === 2 && 'Contact & Location Details'}
              {step === 3 && 'Operations & Profile Summary'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s === step
                    ? 'bg-emerald-500 w-6'
                    : s < step
                    ? 'bg-emerald-700'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-900/80 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* ─── Step 1: Basic Information ──────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">
                Business Name <span className="text-emerald-400">*</span>
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lumina Luxe Spa, Acme Retail, Apex Tech"
                className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Business Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-xs"
                >
                  <option value="SALON">Salon & Spa Aesthetics</option>
                  <option value="CLINIC">Medical Clinic</option>
                  <option value="RESTAURANT">Restaurant & Bistro</option>
                  <option value="GYM">Fitness & Gym Center</option>
                  <option value="REAL_ESTATE">Real Estate Agency</option>
                  <option value="AGENCY">Marketing Agency</option>
                  <option value="CONSULTANT">Consultant / Coach</option>
                  <option value="RETAIL">E-commerce / Retail</option>
                  <option value="GENERAL">General Services</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Skincare, Fashion, Software"
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">
                Business Description <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what your business does..."
                className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs h-24 resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ─── Step 2: Contact & Location ─────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Business Email <span className="text-zinc-500 font-normal">(Optional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@yourbusiness.com"
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Business Phone <span className="text-zinc-500 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Website URL <span className="text-zinc-500 font-normal">(Optional)</span></label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai, Bengaluru..."
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra, Karnataka..."
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ─── Step 3: Operations & Profile Summary ───────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Employee Count</label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Business Growth Stage</label>
                <select
                  value={businessStage}
                  onChange={(e) => setBusinessStage(e.target.value)}
                  className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-xs"
                >
                  <option value="LAUNCH">Early Launch / Startup</option>
                  <option value="GROWTH">Growth & Expansion</option>
                  <option value="SCALE">Scaling Operations</option>
                  <option value="ESTABLISHED">Established Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">
                Target Customers <span className="text-zinc-500 font-normal">(Used by Saarthi AI for tailored copy & strategy)</span>
              </label>
              <input
                type="text"
                value={targetCustomers}
                onChange={(e) => setTargetCustomers(e.target.value)}
                placeholder="e.g. Urban Professionals, College Students, High Net Worth Individuals"
                className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">
                Main Products or Services <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={productsServices}
                onChange={(e) => setProductsServices(e.target.value)}
                placeholder="e.g. Skincare treatments, Hair styling, Consulting packages"
                className="w-full p-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                )}
                <span>{isSubmitting ? 'Saving Business Details...' : 'Complete Setup & Open Dashboard'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-[10px] text-zinc-500 font-mono py-4">
        © {new Date().getFullYear()} Saarthi AI · Encrypted Neon PostgreSQL Database Connection
      </div>
    </div>
  );
}
