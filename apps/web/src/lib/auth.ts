import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { MOCK_AUTH_USERS } from './mock-users';
import { prisma } from './prisma';
import { ROLE_PERMISSIONS } from '@businessos/auth';

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  avatarUrl?: string | null;
  organizationId: string;
  organizationName?: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  isGoogleAuth?: boolean;
  onboardingCompleted?: boolean;
}

const DEFAULT_EMAIL = 'prathamesh@test.com';

/**
 * Server-side authentication utility.
 * Resolves current user from:
 * 1. Active NextAuth session (Google OAuth or NextAuth JWT)
 * 2. Passed email override
 * 3. Fallback environment / default user
 */
export async function getServerUser(emailOverride?: string): Promise<ServerUser> {
  let targetEmail = emailOverride;
  let sessionUser: any = null;

  if (!targetEmail) {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        targetEmail = session.user.email;
        sessionUser = session.user;
      }
    } catch {
      // In standalone script or non-request context
    }
  }

  targetEmail = targetEmail || process.env.SAARTHI_ACTIVE_USER_EMAIL || DEFAULT_EMAIL;

  try {
    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      // Auto-create user if missing in database
      const displayName = sessionUser?.name || targetEmail.split('@')[0];
      const name = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      user = await prisma.user.create({
        data: {
          email: targetEmail,
          name,
          image: sessionUser?.image || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          avatarUrl: sessionUser?.image || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });
    }

    let activeOrgId: string = user.memberships[0]?.organizationId || '';
    let activeRole: 'OWNER' | 'MANAGER' | 'STAFF' = (user.memberships[0]?.role as any) || 'OWNER';

    // If user has no organization membership yet, resolve or provision dedicated isolated organization
    if (!activeOrgId) {
      // Check if user has an existing Business from onboarding that needs an Organization
      const bizUser = await prisma.businessUser.findFirst({
        where: { userId: user.id },
        include: { business: true },
      });

      if (bizUser?.business) {
        const cleanName = bizUser.business.name.trim();
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30) + '-' + user.id.slice(-4);
        const org = await prisma.organization.create({
          data: {
            name: cleanName,
            slug,
            plan: 'PRO',
            status: 'ACTIVE',
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            memberships: {
              create: {
                userId: user.id,
                role: 'OWNER',
                permissions: ROLE_PERMISSIONS['OWNER'],
              },
            },
            profile: {
              create: {
                businessType: bizUser.business.type || 'SALON',
                tagline: bizUser.business.description || `${cleanName} - Excellence in Service`,
                description: bizUser.business.description || '',
                phone: bizUser.business.phone || '+91 90000 00000',
                email: bizUser.business.email || user.email,
                address: bizUser.business.address || 'Commercial Area',
                city: bizUser.business.city || 'Mumbai',
                state: bizUser.business.state || 'Maharashtra',
                zipCode: '400001',
                websiteUrl: bizUser.business.website || null,
              },
            },
            websites: {
              create: {
                domainName: `${slug}.businessos.app`,
                subdomain: slug,
                isPublished: false,
              },
            },
          },
        });
        activeOrgId = org.id;
        activeRole = 'OWNER';
      } else if (
        ['prathamesh@test.com', 'krushna@test.com', 'admin@test.com', 'ananya@luminaluxe.com', 'owner@businessos.com', 'manager@businessos.com', 'staff@businessos.com', 'admin@businessos.com'].includes(targetEmail.toLowerCase())
      ) {
        // Seed demo accounts belong to org-lumina-101
        activeOrgId = 'org-lumina-101';
      } else {
        // Brand new user: provision their isolated personal organization
        const orgSlug = `org-${user.id.slice(-8).toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;
        const newOrg = await prisma.organization.create({
          data: {
            name: `${user.name}'s Workspace`,
            slug: orgSlug,
            plan: 'PRO',
            status: 'ACTIVE',
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            memberships: {
              create: {
                userId: user.id,
                role: 'OWNER',
                permissions: ROLE_PERMISSIONS['OWNER'],
              },
            },
          },
        });
        activeOrgId = newOrg.id;
        activeRole = 'OWNER';
      }
    }

    const orgName = user.memberships.find(m => m.organizationId === activeOrgId)?.organization?.name || 'Workspace';

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || user.avatarUrl || sessionUser?.image,
      avatarUrl: user.avatarUrl || user.image || sessionUser?.image,
      organizationId: activeOrgId,
      organizationName: orgName,
      role: activeRole,
      isGoogleAuth: Boolean(sessionUser),
      onboardingCompleted: user.onboardingCompleted,
    };
  } catch (error) {
    console.error('[getServerUser] Error querying database, returning fallback user context:', error);
    const matchedMock = MOCK_AUTH_USERS.find(
      (u) => u.email.toLowerCase() === targetEmail.toLowerCase() || u.username.toLowerCase() === targetEmail.toLowerCase()
    );
    const displayName = sessionUser?.name || matchedMock?.name || targetEmail.split('@')[0];
    return {
      id: sessionUser?.id || matchedMock?.id || `usr-${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name: sessionUser?.name || matchedMock?.name || (displayName.charAt(0).toUpperCase() + displayName.slice(1)),
      email: matchedMock?.email || targetEmail,
      image: sessionUser?.image || matchedMock?.avatarUrl || null,
      avatarUrl: sessionUser?.image || matchedMock?.avatarUrl || null,
      organizationId: sessionUser?.organizationId || 'org-lumina-101',
      organizationName: 'Lumina Luxe Spa & Salon',
      role: sessionUser?.role || matchedMock?.role || 'OWNER',
      isGoogleAuth: Boolean(sessionUser),
    };
  }
}
