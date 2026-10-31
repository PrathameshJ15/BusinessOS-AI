import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '../../dist/common/guards/auth.guard.js';
import { PermissionsGuard } from '../../dist/common/guards/permissions.guard.js';
import { hasPermission, authorizeAction, ROLE_PERMISSIONS } from '@businessos/auth';
import { dbRepository } from '@businessos/database';

// ─── Middleware Route Resolution Logic Simulator for Validation ──────────────

interface MockRequest {
  url: string;
  pathname: string;
  search: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

const PUBLIC_EXACT_PATHS = ['/', '/login', '/signup', '/register'];
const PUBLIC_PREFIXES = [
  '/site',
  '/go',
  '/api/auth',
  '/api/health',
  '/api/billing/webhook',
  '/api/analytics/track',
  '/api/site',
];

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

function simulateRouteProtection(req: MockRequest): {
  action: 'ALLOW' | 'REDIRECT' | 'REJECT';
  statusCode?: number;
  redirectUrl?: string;
  headers?: Record<string, string>;
} {
  const { pathname, search } = req;

  // 1. Bypass static
  if (pathname.startsWith('/_next') || pathname.match(/\.(?:ico|png|jpg|jpeg|svg|webp|css|js|txt)$/)) {
    return { action: 'ALLOW' };
  }

  // 2. Allow public exact paths
  if (PUBLIC_EXACT_PATHS.includes(pathname)) {
    if (pathname === '/login') {
      const hasError = search.includes('error=');
      const isAuthenticated = Boolean(req.cookies['saarthi_user_email'] || req.cookies['next-auth.session-token']);
      if (!hasError && isAuthenticated) {
        return { action: 'REDIRECT', redirectUrl: '/dashboard' };
      }
    }
    return { action: 'ALLOW' };
  }

  // Allow public prefixes
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return { action: 'ALLOW' };
    }
  }

  // 3. Resolve destination shortcut
  const resolvedTarget = SHORTCUT_ROUTES[pathname];
  const targetDestination = resolvedTarget || pathname;

  // 4. Verify Authentication Context
  const isAuthenticated = Boolean(
    req.cookies['saarthi_user_email'] ||
    req.cookies['next-auth.session-token'] ||
    req.headers['authorization']?.startsWith('Bearer ') ||
    req.headers['x-saarthi-user-email']
  );

  // 5. Unauthenticated handler
  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return { action: 'REJECT', statusCode: 401 };
    }
    const callbackTarget = targetDestination + (resolvedTarget ? '' : search);
    return {
      action: 'REDIRECT',
      statusCode: 307,
      redirectUrl: `/login?callbackUrl=${encodeURIComponent(callbackTarget)}&error=Unauthorized`,
    };
  }

  // 6. Authenticated shortcut redirect
  if (resolvedTarget) {
    return { action: 'REDIRECT', statusCode: 307, redirectUrl: resolvedTarget + search };
  }

  // 7. Authenticated protected page response headers
  const headers: Record<string, string> = {};
  if (pathname.startsWith('/dashboard') || pathname === '/onboarding' || pathname === '/pay') {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }

  return { action: 'ALLOW', headers };
}

describe('Mandatory Login & Route Protection Full Test Suite', () => {
  // ─── 1. PUBLIC ROUTES ACCESSIBILITY TESTS ─────────────────────────────────
  describe('1. Public Routes Unrestricted Access', () => {
    it('should allow unauthenticated access to the public landing page (/)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/',
        pathname: '/',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow unauthenticated access to the login page (/login)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/login',
        pathname: '/login',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow unauthenticated access to the signup page (/signup)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/signup',
        pathname: '/signup',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow unauthenticated access to the register page (/register)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/register',
        pathname: '/register',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow public storefront access (/site/lumina-luxe)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/site/lumina-luxe',
        pathname: '/site/lumina-luxe',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow public smart links (/go/weekend-special)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/go/weekend-special',
        pathname: '/go/weekend-special',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow public health check API (/api/health)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/health',
        pathname: '/api/health',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow Razorpay webhook API (/api/billing/webhook)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/billing/webhook',
        pathname: '/api/billing/webhook',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow public analytics tracking (/api/analytics/track)', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/analytics/track',
        pathname: '/api/analytics/track',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });
  });

  // ─── 2. PROTECTED ROUTES REDIRECTION TESTS ────────────────────────────────
  describe('2. Protected Internal Routes Authentication Blocking', () => {
    it('should redirect unauthenticated /dashboard access to /login with callbackUrl', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/dashboard',
        pathname: '/dashboard',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(res.statusCode, 307);
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /dashboard/customers access to /login preserving subpath', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/dashboard/customers',
        pathname: '/dashboard/customers',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard%2Fcustomers&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /dashboard/bookings access to /login', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/dashboard/bookings',
        pathname: '/dashboard/bookings',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard%2Fbookings&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /dashboard/marketing access to /login', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/dashboard/marketing',
        pathname: '/dashboard/marketing',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard%2Fmarketing&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /dashboard/ai access to /login', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/dashboard/ai',
        pathname: '/dashboard/ai',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard%2Fai&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /dashboard/settings access to /login', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/dashboard/settings',
        pathname: '/dashboard/settings',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard%2Fsettings&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /onboarding access to /login', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/onboarding',
        pathname: '/onboarding',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fonboarding&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /pay access to /login', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/pay',
        pathname: '/pay',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fpay&error=Unauthorized'
      );
    });
  });

  // ─── 3. SHORTCUT ALIAS ROUTES TESTS ──────────────────────────────────────
  describe('3. Shortcut Alias Routes Redirection', () => {
    it('should redirect unauthenticated /crm to login pointing to /dashboard/customers', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/crm',
        pathname: '/crm',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard%2Fcustomers&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /leads to login pointing to /dashboard/customers', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/leads',
        pathname: '/leads',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard%2Fcustomers&error=Unauthorized'
      );
    });

    it('should redirect unauthenticated /bookings to login pointing to /dashboard/bookings', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/bookings',
        pathname: '/bookings',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(
        res.redirectUrl,
        '/login?callbackUrl=%2Fdashboard%2Fbookings&error=Unauthorized'
      );
    });

    it('should redirect authenticated user accessing /crm directly to /dashboard/customers', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/crm',
        pathname: '/crm',
        search: '',
        headers: {},
        cookies: { saarthi_user_email: 'owner@businessos.com' },
      });
      assert.strictEqual(res.action, 'REDIRECT');
      assert.strictEqual(res.redirectUrl, '/dashboard/customers');
    });
  });

  // ─── 4. BACKEND API ROUTE PROTECTION TESTS ────────────────────────────────
  describe('4. Backend API Route 401 Rejection', () => {
    it('should reject unauthenticated /api/customers with 401 Unauthorized', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/customers',
        pathname: '/api/customers',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REJECT');
      assert.strictEqual(res.statusCode, 401);
    });

    it('should reject unauthenticated /api/dashboard with 401 Unauthorized', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/dashboard',
        pathname: '/api/dashboard',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REJECT');
      assert.strictEqual(res.statusCode, 401);
    });

    it('should reject unauthenticated /api/bookings with 401 Unauthorized', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/bookings',
        pathname: '/api/bookings',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REJECT');
      assert.strictEqual(res.statusCode, 401);
    });

    it('should reject unauthenticated /api/marketing with 401 Unauthorized', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/marketing',
        pathname: '/api/marketing',
        search: '',
        headers: {},
        cookies: {},
      });
      assert.strictEqual(res.action, 'REJECT');
      assert.strictEqual(res.statusCode, 401);
    });

    it('should allow authenticated /api/customers request with cookie', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/customers',
        pathname: '/api/customers',
        search: '',
        headers: {},
        cookies: { saarthi_user_email: 'owner@businessos.com' },
      });
      assert.strictEqual(res.action, 'ALLOW');
    });

    it('should allow authenticated /api/customers request with Bearer authorization header', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/api/customers',
        pathname: '/api/customers',
        search: '',
        headers: { authorization: 'Bearer test-jwt-token' },
        cookies: {},
      });
      assert.strictEqual(res.action, 'ALLOW');
    });
  });

  // ─── 5. SECURITY HEADERS & LOGOUT BACK-NAVIGATION TESTS ───────────────────
  describe('5. Anti-Cache Headers on Protected Pages', () => {
    it('should attach strict anti-cache headers on authenticated /dashboard responses', () => {
      const res = simulateRouteProtection({
        url: 'http://localhost:3000/dashboard',
        pathname: '/dashboard',
        search: '',
        headers: {},
        cookies: { saarthi_user_email: 'owner@businessos.com' },
      });
      assert.strictEqual(res.action, 'ALLOW');
      assert.strictEqual(
        res.headers?.['Cache-Control'],
        'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      );
      assert.strictEqual(res.headers?.['Pragma'], 'no-cache');
      assert.strictEqual(res.headers?.['Expires'], '0');
    });
  });

  // ─── 6. NESTJS AUTHGUARD & RBAC EVALUATION TESTS ──────────────────────────
  describe('6. NestJS AuthGuard & PermissionsGuard Verification', () => {
    const authGuard = new AuthGuard();

    it('should throw UnauthorizedException when no authorization or user headers exist', () => {
      const mockCtx = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
      };
      assert.throws(
        () => authGuard.canActivate(mockCtx as any),
        (err: any) => err instanceof UnauthorizedException
      );
    });

    it('should attach verified session to request when valid Bearer token provided', () => {
      const mockReq = { headers: { authorization: 'Bearer test-token' }, user: null as any };
      const mockCtx = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
        }),
      };
      const result = authGuard.canActivate(mockCtx as any);
      assert.strictEqual(result, true);
      assert.strictEqual(mockReq.user?.organizationId, 'org-lumina-101');
      assert.strictEqual(mockReq.user?.role, 'OWNER');
    });

    it('should correctly enforce RBAC permissions matrix', () => {
      assert.strictEqual(hasPermission('OWNER', 'settings:write'), true);
      assert.strictEqual(hasPermission('OWNER', 'org:billing'), true);
      assert.strictEqual(hasPermission('MANAGER', 'settings:write'), false);
      assert.strictEqual(hasPermission('MANAGER', 'org:billing'), false);
      assert.strictEqual(hasPermission('STAFF', 'customers:write'), false);
      assert.strictEqual(hasPermission('STAFF', 'bookings:read'), true);
    });

    it('should maintain strict multi-tenant customer isolation', () => {
      const orgACustomers = dbRepository.getCustomers('org-lumina-101');
      const orgBCustomers = dbRepository.getCustomers('org-competitor-999');
      assert.strictEqual(orgBCustomers.length, 0);
      assert.ok(orgACustomers.every((c) => c.organizationId === 'org-lumina-101'));
    });
  });
});
