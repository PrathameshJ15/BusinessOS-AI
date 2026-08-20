import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { getUserAIUsage } from '@/lib/data/usage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;

    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);
    const usage = await getUserAIUsage(user.id);

    return NextResponse.json(usage);
  } catch (error) {
    console.error('[GET /api/usage] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
