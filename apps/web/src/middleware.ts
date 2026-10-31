import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'businessos-super-secret-nextauth-session-key-2026';

// Explicit public routes that never require authentication
const PUBLIC_EXACT_PATHS = [
  '/',
  '/login',
  '/signup',
  '/register',
];

// Public route prefixes
const PUBLIC_PREFIXES = [
  '/site',               // Public business storefronts (e.g. /site/lumina-luxe)
  '/go',                 // Public marketing smart links (e.g. /go/promo)
  '/api/auth',           // NextAuth authentication endpoints (session, csrf, signin, callback)
  '/api/health',         // Health check endpoint
  '/api/billing/webhook', // Razorpay webhook receiver
  '/api/analytics/track', // Public visit tracking telemetry
  '/api/site',           // Public storefront API
];

// Map of legacy or friendly shortcut routes to actual dashboard destination
const SHORTCUT_ROUTES: Record<string, string> = {
  '/crm': '/dashboard/customers',
  '/leads': '/dashboard/customers',
  '/customers': '/dashboard/customers',
  '/bookings': '/dashboard/bookings',
  '/marketing': '/dashboard/marketing',
  '/website': '/dashboard/website',
  '/ai': '/dashboard/ai',
  '/settings': '/dashboard/settings',
  '/billing': '/dashboard/settings',
};

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Bypass static resources and asset files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(?:ico|png|jpg|jpeg|svg|webp|css|js|txt)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Allow explicitly public routes (Landing, Login, Signup, Register)
  if (PUBLIC_EXACT_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Check public prefixes
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return NextResponse.next();
    }
  }

  // 3. Resolve destination if user accessed a shortcut URL (/crm, /bookings, etc.)
  const resolvedTarget = SHORTCUT_ROUTES[pathname];
  const targetDestination = resolvedTarget || pathname;

  // 4. Verify Authentication Context
  const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });
  const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;
  const authHeader = request.headers.get('authorization');
  const userEmailHeader = request.headers.get('x-saarthi-user-email');

  const isAuthenticated = Boolean(
    token ||
    sessionToken ||
    cookieEmail ||
    (authHeader && authHeader.startsWith('Bearer ')) ||
    userEmailHeader
  );

  // 5. Handle Unauthenticated Requests
  if (!isAuthenticated) {
    // If request targets an API endpoint: reject with 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Authentication required before accessing internal SaaS APIs.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // If request targets a page route: redirect to /login with preserved callbackUrl
    const loginUrl = new URL('/login', request.url);
    const callbackPath = targetDestination + (resolvedTarget ? '' : search);
    loginUrl.searchParams.set('callbackUrl', callbackPath);
    loginUrl.searchParams.set('error', 'Unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // 6. Handle Authenticated Shortcut Redirects (e.g. /crm -> /dashboard/customers)
  if (resolvedTarget) {
    return NextResponse.redirect(new URL(resolvedTarget + search, request.url));
  }

  // 7. Authenticated User accessing Protected Pages: Attach Anti-Cache Security Headers
  // Prevents browser Back-Forward Cache (BFCache) from rendering stale protected pages after logout
  const response = NextResponse.next();
  if (
    pathname.startsWith('/dashboard') ||
    pathname === '/onboarding' ||
    pathname === '/pay'
  ) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo-*.png, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
