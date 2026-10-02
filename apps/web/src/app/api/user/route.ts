import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getServerUser } from '@/lib/auth';
import { updateUser } from '@/lib/data/users';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/user — Get current authenticated user details from database ──

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const targetEmail = activeEmailHeader || session?.user?.email || cookieEmail || undefined;

    const user = await getServerUser(targetEmail);
    return NextResponse.json({
      ...user,
      isGoogleAuth: Boolean(session?.user?.email && session.user.email === user.email),
    });
  } catch (error) {
    console.error('[GET /api/user] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve user context.' }, { status: 500 });
  }
}

// ─── PATCH /api/user — Update user settings ──────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const currentUser = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const body = await request.json();
    const updatedDbUser = await updateUser(currentUser.id, body);

    const updatedUser = {
      ...currentUser,
      name: updatedDbUser.name,
      email: updatedDbUser.email,
      image: updatedDbUser.image || updatedDbUser.avatarUrl,
      avatarUrl: updatedDbUser.avatarUrl || updatedDbUser.image,
      phone: updatedDbUser.phone,
    };

    const response = NextResponse.json({ success: true, user: updatedUser });

    if (body.email && body.email.trim() !== currentUser.email) {
      response.cookies.set('saarthi_user_email', updatedDbUser.email, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 86400 * 30,
      });
    }

    return response;
  } catch (error: any) {
    console.error('[PATCH /api/user] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user settings.' }, { status: 500 });
  }
}

// ─── POST /api/user/switch — Switch current active account ──────────────────

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const user = await getServerUser(email.trim());

    const response = NextResponse.json({ success: true, user });
    response.cookies.set('saarthi_user_email', user.email, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('[POST /api/user/switch] Error:', error);
    return NextResponse.json({ error: 'Failed to switch user account.' }, { status: 500 });
  }
}
