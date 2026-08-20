import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/conversations — List user's conversations ─────────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const conversations = await prisma.aiConversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('[Conversations] List error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── POST /api/conversations — Create new conversation ──────────────────────

export async function POST(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let title = 'New conversation';
    try {
      const body = await request.json();
      if (body.title && typeof body.title === 'string') {
        title = body.title.trim().slice(0, 120);
      }
    } catch {
      // No body or invalid JSON — use default title
    }

    const conversation = await prisma.aiConversation.create({
      data: { userId: user.id, title },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('[Conversations] Create error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
