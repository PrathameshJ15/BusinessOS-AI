'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SidebarNav, HeaderNav, MobileBottomNav } from '../../components/Navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cookieAuthChecked, setCookieAuthChecked] = useState(false);
  const [hasAuthCookie, setHasAuthCookie] = useState(false);

  useEffect(() => {
    const hasCookie = Boolean(
      document.cookie.includes('saarthi_user_email=') ||
      document.cookie.includes('next-auth.session-token=') ||
      document.cookie.includes('__Secure-next-auth.session-token=')
    );
    setHasAuthCookie(hasCookie);
    setCookieAuthChecked(true);
  }, []);

  // Close mobile drawer whenever the user navigates
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Client-side authentication guard: enforce login before rendering protected application content
  useEffect(() => {
    if (!cookieAuthChecked) return;
    if (status === 'unauthenticated' && !hasAuthCookie) {
      const destination = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/login?callbackUrl=${destination}&error=Unauthorized`);
    }
  }, [cookieAuthChecked, hasAuthCookie, status, pathname, router]);

  // Back-Forward Cache (BFCache) protection: prevents browser back navigation from restoring cached dashboard after logout
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && status === 'unauthenticated' && !hasAuthCookie) {
        window.location.replace('/login?error=SessionExpired');
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [status, hasAuthCookie]);

  // Show secure loading state while session verification completes
  if (!cookieAuthChecked || (status === 'loading' && !hasAuthCookie)) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#09090b] text-zinc-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <span className="text-xs font-mono tracking-tight text-zinc-500 dark:text-zinc-400">
            Verifying secure session...
          </span>
        </div>
      </div>
    );
  }

  // Do not render protected application content for unauthenticated users
  if (status === 'unauthenticated' && !hasAuthCookie) {
    return null;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex bg-zinc-50 dark:bg-[#09090b] font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-x-hidden">
      <SidebarNav mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <HeaderNav onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-28 lg:pb-8 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileBottomNav onOpenMobileMenu={() => setMobileNavOpen(true)} />
    </div>
  );
}
