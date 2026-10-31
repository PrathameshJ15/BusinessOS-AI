import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Authentication session successfully cleared.',
  });

  // Explicitly clear all authentication and tracking cookies
  response.cookies.set('saarthi_user_email', '', {
    path: '/',
    maxAge: 0,
    httpOnly: false,
    sameSite: 'lax',
  });

  response.cookies.set('next-auth.session-token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
  });

  response.cookies.set('__Secure-next-auth.session-token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });

  response.cookies.set('next-auth.csrf-token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
  });

  return response;
}
