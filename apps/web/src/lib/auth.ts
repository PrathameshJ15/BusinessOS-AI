import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { prisma } from './prisma';

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  avatarUrl?: string | null;
  organizationId: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  isGoogleAuth?: boolean;
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
      include: { memberships: true },
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
        include: { memberships: true },
      });
    }

    const membership = user.memberships[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || user.avatarUrl || sessionUser?.image,
      avatarUrl: user.avatarUrl || user.image || sessionUser?.image,
      organizationId: membership?.organizationId || sessionUser?.organizationId || 'org-lumina-101',
      role: (membership?.role as any) || sessionUser?.role || 'OWNER',
      isGoogleAuth: Boolean(sessionUser),
    };
  } catch (error) {
    console.error('[getServerUser] Error querying database, returning fallback user context:', error);
    const displayName = sessionUser?.name || targetEmail.split('@')[0];
    return {
      id: sessionUser?.id || `usr-${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: targetEmail,
      image: sessionUser?.image || null,
      avatarUrl: sessionUser?.image || null,
      organizationId: sessionUser?.organizationId || 'org-lumina-101',
      role: sessionUser?.role || 'OWNER',
      isGoogleAuth: Boolean(sessionUser),
    };
  }
}
