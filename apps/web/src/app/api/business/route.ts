import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { getBusinessForUser, updateBusiness } from '@/lib/data/business';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/business — Fetch current active business ─────────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const business = await getBusinessForUser(user.id);
    if (!business) {
      return NextResponse.json({ error: 'No business found for user.' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('[GET /api/business] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve business information.' }, { status: 500 });
  }
}

// ─── PATCH /api/business — Update business details ─────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const business = await getBusinessForUser(user.id);
    if (!business) {
      return NextResponse.json({ error: 'No business found to update.' }, { status: 404 });
    }

    const body = await request.json();
    const updated = await updateBusiness(business.id, user.id, body);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PATCH /api/business] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update business details.' }, { status: 400 });
  }
}
