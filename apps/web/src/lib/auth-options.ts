import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { ROLE_PERMISSIONS } from '@businessos/auth';

import { MOCK_AUTH_USERS, MockAuthUser } from './mock-users';
export { MOCK_AUTH_USERS };
export type { MockAuthUser };

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
      id: 'credentials',
      name: 'Username & Password',
      credentials: {
        username: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter both username/email and password.');
        }

        const inputUser = credentials.username.toLowerCase().trim();
        const inputPass = credentials.password;

        const matched = MOCK_AUTH_USERS.find(
          (u) => u.username.toLowerCase() === inputUser || u.email.toLowerCase() === inputUser
        );

        if (!matched) {
          throw new Error('Account not found. Please verify your username or email.');
        }

        if (matched.password !== inputPass) {
          throw new Error('Invalid password. Please check your credentials.');
        }

        let dbUserId = matched.id;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: matched.email },
          });
          if (dbUser) {
            dbUserId = dbUser.id;
          }
        } catch {
          // Keep default if database is in fallback mode
        }

        return {
          id: dbUserId,
          name: matched.name,
          email: matched.email,
          image: matched.avatarUrl,
        };
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
        const matched = MOCK_AUTH_USERS.find(
          (u) => u.email.toLowerCase() === email || u.username.toLowerCase() === email
        );
        const displayName = credentials.name || matched?.name || email.split('@')[0];
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        return {
          id: matched?.id || `usr-${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          name: formattedName,
          email: matched?.email || email,
          image: matched?.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        const matchedMock = MOCK_AUTH_USERS.find(
          (u) => u.email.toLowerCase() === user.email!.toLowerCase()
        );

        // Sync authenticated user with database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { memberships: true },
        });

        if (!dbUser) {
          const displayName = user.name || matchedMock?.name || user.email.split('@')[0];
          const name = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name,
              image: user.image || matchedMock?.avatarUrl || null,
              avatarUrl: user.image || matchedMock?.avatarUrl || null,
              onboardingCompleted: true,
            },
            include: { memberships: true },
          });

          // Predefined workspace for mock accounts
          const isKnownWorkspaceAccount = Boolean(matchedMock) || ['prathamesh@test.com', 'krushna@test.com', 'admin@test.com', 'ananya@luminaluxe.com'].includes(user.email.toLowerCase());
          let orgId = isKnownWorkspaceAccount ? 'org-lumina-101' : null;

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

          const targetRole = matchedMock?.role || 'OWNER';
          await prisma.membership.create({
            data: {
              userId: dbUser.id,
              organizationId: orgId,
              role: targetRole,
              permissions: ROLE_PERMISSIONS[targetRole] || ROLE_PERMISSIONS['OWNER'],
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

        const matchedMock = MOCK_AUTH_USERS.find(
          (u) => u.email.toLowerCase() === (user.email || '').toLowerCase()
        );

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
          const isDemoAccount = Boolean(matchedMock) || ['prathamesh@test.com', 'krushna@test.com', 'admin@test.com', 'ananya@luminaluxe.com'].includes(token.email?.toLowerCase() || '');
          token.organizationId = isDemoAccount ? 'org-lumina-101' : `org-${token.id || 'personal'}`;
        }
        if (!token.role) {
          token.role = matchedMock?.role || 'OWNER';
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
