import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { ROLE_PERMISSIONS } from '@businessos/auth';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'businessos-super-secret-nextauth-session-key-32-chars',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      id: 'demo-login',
      name: 'Quick Switch / Demo Login',
      credentials: {
        email: { label: 'Email', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email.toLowerCase().trim();
        const displayName = credentials.name || email.split('@')[0];
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        return {
          id: `usr-${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          name: formattedName,
          email,
          image: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Sync authenticated user with database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { memberships: true },
        });

        if (!dbUser) {
          const displayName = user.name || user.email.split('@')[0];
          const name = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name,
              image: user.image || null,
              avatarUrl: user.image || null,
              onboardingCompleted: false,
            },
            include: { memberships: true },
          });

          // Check if predefined demo account
          const isDemoAccount = ['prathamesh@test.com', 'krushna@test.com', 'admin@test.com', 'ananya@luminaluxe.com'].includes(user.email.toLowerCase());
          let orgId = isDemoAccount ? 'org-lumina-101' : null;

          if (!orgId) {
            // Provision dedicated isolated Organization for new user
            const orgSlug = `org-${dbUser.id.slice(-8).toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;
            const newOrg = await prisma.organization.create({
              data: {
                name: `${name}'s Workspace`,
                slug: orgSlug,
                plan: 'PRO',
                status: 'ACTIVE',
                currency: 'INR',
                timezone: 'Asia/Kolkata',
              },
            });
            orgId = newOrg.id;
          }

          await prisma.membership.create({
            data: {
              userId: dbUser.id,
              organizationId: orgId,
              role: 'OWNER',
              permissions: ROLE_PERMISSIONS['OWNER'],
            },
          });
        }
      } catch (err) {
        console.warn('[NextAuth signIn] Database sync warning (using fallback store):', err);
      }

      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // Try to query role and organizationId
        try {
          if (user.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
              include: { memberships: true },
            });
            if (dbUser && dbUser.memberships?.length > 0) {
              token.organizationId = dbUser.memberships[0].organizationId;
              token.role = dbUser.memberships[0].role;
            }
          }
        } catch {
          // Keep defaults if database is in fallback mode
        }

        if (!token.organizationId) {
          const isDemoAccount = ['prathamesh@test.com', 'krushna@test.com', 'admin@test.com', 'ananya@luminaluxe.com'].includes(token.email?.toLowerCase() || '');
          token.organizationId = isDemoAccount ? 'org-lumina-101' : `org-${token.id || 'personal'}`;
        }
        if (!token.role) {
          token.role = 'OWNER';
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).role = token.role || 'OWNER';
      }
      return session;
    },
  },
};
