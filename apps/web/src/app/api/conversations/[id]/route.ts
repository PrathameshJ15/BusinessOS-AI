import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

// ─── GET /api/conversations/[id] — Get conversation with messages ───────────

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);
    const { id } = params;

    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('[Conversation] Get error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/conversations/[id] — Rename conversation ────────────────────

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);
    const { id } = params;

    let body: { title?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required.' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.aiConversation.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Conversation not found.' },
        { status: 404 }
      );
    }

    const updated = await prisma.aiConversation.update({
      where: { id },
      data: { title: body.title.trim().slice(0, 120) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[Conversation] Rename error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/conversations/[id] — Delete conversation + messages ────────

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);
    const { id } = params;

    // Verify ownership
    const existing = await prisma.aiConversation.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Conversation not found.' },
        { status: 404 }
      );
    }

    // Cascade delete removes messages automatically
    await prisma.aiConversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Conversation] Delete error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
