'use client';

import React, { useState, Suspense } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
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

  const { data: session, status } = useSession();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeDemoLoading, setActiveDemoLoading] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error('Google sign-in error:', err);
      setIsGoogleLoading(false);
    }
  };

  const handleDemoSignIn = async (email: string, name: string) => {
    setActiveDemoLoading(email);
    try {
      // Set session cookie for instant sync
      document.cookie = `saarthi_user_email=${email}; path=/; max-age=${86400 * 30}; SameSite=Lax`;
      const result = await signIn('demo-login', {
        email,
        name,
        callbackUrl,
        redirect: false,
      });
      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error('Demo sign-in error:', err);
    } finally {
      setActiveDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <Logo href="/" size={44} showText textVariant="landing" priority />
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white text-center">
            Sign in to BusinessOS AI
          </h2>
          <p className="mt-2 text-xs text-zinc-400 text-center max-w-sm">
            Access your AI-powered operating system, customer CRM, campaigns, and intelligent automations.
          </p>
        </div>

        {/* Error notification */}
        {errorParam && (
          <div className="mb-6 p-3.5 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold text-red-200">Authentication Alert</p>
              <p className="text-[11px] text-red-300/90 mt-0.5">
                {errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback'
                  ? 'Unable to connect to Google OAuth. Please verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET credentials in your .env configuration.'
                  : 'An error occurred during authentication. Please try again.'}
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
                  <span className="text-xs font-semibold text-zinc-400">Signed in as</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Google Active
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
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-all border border-zinc-700/60"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign-In Card */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Primary Google Auth Button */}
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
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Fast, secure single sign-on powered by Google OAuth 2.0 with automatic organization workspace binding.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-900 px-3 text-zinc-500 font-medium uppercase tracking-wider text-[10px]">
                  Or Instant Demo Access
                </span>
              </div>
            </div>

            {/* Instant Demo Accounts Switcher */}
            <div className="space-y-2">
              <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 mb-2">
                <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>Pre-configured workspace accounts:</span>
              </p>

              <button
                type="button"
                onClick={() => handleDemoSignIn('prathamesh@test.com', 'Prathamesh')}
                disabled={activeDemoLoading !== null}
                className="w-full flex items-center justify-between p-2.5 bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800/80 hover:border-emerald-500/40 rounded-xl text-left transition-all group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400">
                      Prathamesh Jadhav
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      Owner
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate">prathamesh@test.com</p>
                </div>
                {activeDemoLoading === 'prathamesh@test.com' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('krushna@test.com', 'Krushna')}
                disabled={activeDemoLoading !== null}
                className="w-full flex items-center justify-between p-2.5 bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800/80 hover:border-blue-500/40 rounded-xl text-left transition-all group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400">
                      Krushna
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                      Manager
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate">krushna@test.com</p>
                </div>
                {activeDemoLoading === 'krushna@test.com' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                )}
              </button>
            </div>

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
            ← Return to Saarthi AI Homepage
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
