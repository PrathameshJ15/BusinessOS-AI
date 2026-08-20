import { prisma } from './prisma';

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  avatarUrl?: string | null;
  organizationId: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}

const DEFAULT_EMAIL = 'prathamesh@test.com';

/**
 * Server-side authentication utility.
 * Resolves current user from Neon PostgreSQL via Prisma.
 */
export async function getServerUser(emailOverride?: string): Promise<ServerUser> {
  const targetEmail = emailOverride || process.env.SAARTHI_ACTIVE_USER_EMAIL || DEFAULT_EMAIL;

  try {
    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { memberships: true },
    });

    if (!user) {
      // Auto-create user if missing in database
      const displayName = targetEmail.split('@')[0];
      const name = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      user = await prisma.user.create({
        data: {
          email: targetEmail,
          name,
          image: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        },
        include: { memberships: true },
      });
    }

    const membership = user.memberships[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || user.avatarUrl,
      avatarUrl: user.avatarUrl || user.image,
      organizationId: membership?.organizationId || 'org-lumina-101',
      role: (membership?.role as any) || 'OWNER',
    };
  } catch (error) {
    console.error('[getServerUser] Error querying database, returning fallback user context:', error);
    const displayName = targetEmail.split('@')[0];
    return {
      id: `usr-${displayName}`,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: targetEmail,
      image: null,
      avatarUrl: null,
      organizationId: 'org-lumina-101',
      role: 'OWNER',
    };
  }
}
