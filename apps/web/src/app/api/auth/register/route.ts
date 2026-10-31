import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerMockUser } from '@/lib/mock-users';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password, businessName } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanBusiness = (businessName && typeof businessName === 'string' && businessName.trim()) 
      ? businessName.trim() 
      : `${cleanName}'s Business`;

    // 1. Register in memory mock users for instant NextAuth authorization
    const mockUser = registerMockUser({
      name: cleanName,
      email: normalizedEmail,
      password: password,
      role: 'OWNER',
    });

    // 2. Persist in Prisma database if database connection is available
    let dbUser = null;
    try {
      dbUser = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          name: cleanName,
        },
        create: {
          email: normalizedEmail,
          name: cleanName,
          onboardingCompleted: false,
        },
      });

      // Find or create organization
      const orgSlug = cleanBusiness.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const org = await prisma.organization.upsert({
        where: { slug: orgSlug },
        update: { name: cleanBusiness },
        create: {
          name: cleanBusiness,
          slug: `${orgSlug}-${Date.now().toString().slice(-4)}`,
        },
      });

      // Link membership
      await prisma.membership.upsert({
        where: {
          organizationId_userId: {
            userId: dbUser.id,
            organizationId: org.id,
          },
        },
        update: { role: 'OWNER' },
        create: {
          userId: dbUser.id,
          organizationId: org.id,
          role: 'OWNER',
          permissions: ['ALL'],
        },
      });
    } catch (dbErr) {
      console.warn('[Register API] Database sync in fallback mode:', dbErr);
    }

    // 3. Set session cookie on response
    const response = NextResponse.json({
      success: true,
      user: {
        id: dbUser?.id || mockUser.id,
        name: cleanName,
        email: normalizedEmail,
        role: 'OWNER',
      },
      businessName: cleanBusiness,
      message: 'Account created successfully.',
    });

    response.cookies.set('saarthi_user_email', normalizedEmail, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 30,
    });

    return response;
  } catch (error: any) {
    console.error('[POST /api/auth/register] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
