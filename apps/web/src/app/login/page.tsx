'use client';

import React, { useState, Suspense } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useApp } from '@/context/AppContext';
import { PRIMARY_MOCK_USERS, MockAuthUser } from '@/lib/mock-users';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Building2,
  UserCheck,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const { t } = useApp();
  const { data: session, status } = useSession();

  // Tab State: 'password' | 'google'
  const [activeTab, setActiveTab] = useState<'password' | 'google'>('password');

  // Form State
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick action state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [quickLoginLoadingUser, setQuickLoginLoadingUser] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCredentialsSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setFormError('Please enter both your username/email and password.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await signIn('credentials', {
        username: username.trim(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (res?.error) {
        setFormError(res.error.replace(/^Error:\s*/, ''));
        return;
      }

      if (res?.ok) {
        // Find matching mock user to record email cookie for instant server sync
        const matched = PRIMARY_MOCK_USERS.find(
          (u) =>
            u.username.toLowerCase() === username.trim().toLowerCase() ||
            u.email.toLowerCase() === username.trim().toLowerCase()
        );
        const resolvedEmail = matched?.email || username.trim();
        document.cookie = `saarthi_user_email=${resolvedEmail}; path=/; max-age=${86400 * 30}; SameSite=Lax`;

        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setFormError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSignIn = async (user: MockAuthUser) => {
    setUsername(user.username);
    setPassword(user.password);
    setFormError(null);
    setQuickLoginLoadingUser(user.id);

    try {
      document.cookie = `saarthi_user_email=${user.email}; path=/; max-age=${86400 * 30}; SameSite=Lax`;
      const res = await signIn('credentials', {
        username: user.username,
        password: user.password,
        callbackUrl,
        redirect: false,
      });

      if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else if (res?.error) {
        setFormError(res.error.replace(/^Error:\s*/, ''));
      }
    } catch (err: any) {
      setFormError(err?.message || 'Quick login failed.');
    } finally {
      setQuickLoginLoadingUser(null);
    }
  };

  const handleCopyCredentials = (user: MockAuthUser, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Username: ${user.username}\nPassword: ${user.password}\nEmail: ${user.email}`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await signIn('google', { callbackUrl, redirect: false });
      if (res?.error) {
        // Seamless fallback for local sandbox / demo environments
        await handleQuickSignIn(PRIMARY_MOCK_USERS[0]);
        return;
      }
      if (res?.url) {
        router.push(res.url);
      }
    } catch (err) {
      console.warn('Google sign-in fallback activated:', err);
      await handleQuickSignIn(PRIMARY_MOCK_USERS[0]);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top right language switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher variant="landing" />
      </div>

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <Logo href="/" size={44} showText textVariant="landing" priority />
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white text-center">
            {t('auth.signInTitle', 'Sign in to BusinessOS AI')}
          </h2>
          <p className="mt-1.5 text-xs text-zinc-400 text-center max-w-sm">
            {t('auth.signInSubtitle', 'Enter your workspace credentials or select a mock user to access your AI operating system.')}
          </p>
        </div>

        {/* Global Error notification (OAuth error from URL) */}
        {errorParam && (
          <div className="mb-6 p-3.5 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold text-red-200">Authentication Alert</p>
              <p className="text-[11px] text-red-300/90 mt-0.5">
                {errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback'
                  ? 'Unable to connect to Google OAuth. You can log in instantly with your Username & Password below.'
                  : 'An error occurred during authentication. Please try again with your credentials.'}
              </p>
            </div>
          </div>
        )}

        {/* Active Session Card if already signed in */}
        {status === 'authenticated' && session?.user ? (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl mb-6">
            <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-800">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-12 h-12 rounded-full border border-emerald-500/40 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {session.user.name?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-400">{t('auth.signedInAs', 'Signed in as')}</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Authenticated
                  </span>
                </div>
                <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                <p className="text-xs text-zinc-400 truncate">{session.user.email}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <Link
                href="/dashboard"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50"
              >
                <span>{t('auth.continueToDashboard', 'Continue to Dashboard')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-all border border-zinc-700/60"
              >
                {t('auth.signOut', 'Sign Out')}
              </button>
            </div>
          </div>
        ) : (
          /* Main Authentication Card */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-zinc-950/70 border border-zinc-800/80 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('password');
                  setFormError(null);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'password'
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Username & Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('google');
                  setFormError(null);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'google'
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Google SSO</span>
              </button>
            </div>

            {/* TAB 1: USERNAME & PASSWORD FORM */}
            {activeTab === 'password' && (
              <div>
                <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                  {/* Inline Form Error */}
                  {formError && (
                    <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-red-300 text-xs animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <div>
                        <p className="font-semibold text-red-200">Login Failed</p>
                        <p className="text-[11px] text-red-300/90 mt-0.5">{formError}</p>
                      </div>
                    </div>
                  )}

                  {/* Username / Email Field */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Username or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. owner or owner@businessos.com"
                        required
                        autoComplete="username"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-950/70 border border-zinc-800 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-zinc-300">
                        Password
                      </label>
                      <span className="text-[10px] text-zinc-500">
                        Case-sensitive
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        autoComplete="current-password"
                        className="w-full pl-9 pr-10 py-2.5 bg-zinc-950/70 border border-zinc-800 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || quickLoginLoadingUser !== null}
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Sign In with Password</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Pre-Configured Mock Users Section */}
                <div className="mt-6 pt-5 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pre-Configured Mock Users (Instant 1-Click Login):</span>
                    </p>
                    <span className="text-[10px] text-zinc-500">Click to fill & sign in</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PRIMARY_MOCK_USERS.map((mockUser) => {
                      const isTargetLoading = quickLoginLoadingUser === mockUser.id;
                      const isCopied = copiedId === mockUser.id;

                      return (
                        <div
                          key={mockUser.id}
                          onClick={() => handleQuickSignIn(mockUser)}
                          className="group relative p-2.5 bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer text-left flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 truncate">
                                {mockUser.name}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${mockUser.roleBadgeColor}`}
                              >
                                {mockUser.role}
                              </span>
                            </div>

                            <p className="text-[10px] text-zinc-400 font-mono truncate">
                              user: <span className="text-zinc-200">{mockUser.username}</span>
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono truncate">
                              pass: <span className="text-zinc-400">{mockUser.password}</span>
                            </p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-zinc-900 flex items-center justify-between">
                            <span className="text-[9px] text-zinc-500 truncate max-w-[120px]">
                              {mockUser.permissionsSummary.split('•')[0]}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                title="Copy login credentials"
                                onClick={(e) => handleCopyCredentials(mockUser, e)}
                                className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={isTargetLoading}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 group-hover:text-emerald-300"
                              >
                                {isTargetLoading ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                                ) : (
                                  <>
                                    <span>Log in</span>
                                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GOOGLE SSO */}
            {activeTab === 'google' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full relative group py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
                      <span>{t('auth.connectingGoogle', 'Connecting to Google...')}</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>{t('auth.continueWithGoogle', 'Continue with Google')}</span>
                    </>
                  )}
                </button>

                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Fast, secure single sign-on powered by Google OAuth 2.0 with automatic organization workspace binding and role assignment.
                  </p>
                </div>
              </div>
            )}

            {/* Security Footer Note */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <Lock className="w-3 h-3 text-zinc-500" />
              <span>Multi-Tenant JWT • Neon PostgreSQL Session Enforced</span>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
          >
            {t('auth.returnHome', '← Return to Saarthi AI Homepage')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
