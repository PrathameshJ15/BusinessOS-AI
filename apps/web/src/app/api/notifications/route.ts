import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockNotifications } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/notifications — Retrieve Tenant Notifications ───────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let notifications = await prisma.notification.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (notifications.length === 0 && user.organizationId === 'org-lumina-101') {
      try {
        await prisma.notification.createMany({
          data: mockNotifications.map((n) => ({
            organizationId: user.organizationId,
            userId: user.id,
            type: n.type || 'SYSTEM',
            title: n.title,
            message: n.message,
            isRead: Boolean(n.isRead),
          })),
        });

        notifications = await prisma.notification.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
      } catch (seedErr) {
        console.warn('[GET /api/notifications] Seed fallback warning:', seedErr);
        notifications = mockNotifications.map((n) => ({
          ...n,
          organizationId: user.organizationId,
          userId: user.id,
        })) as any;
      }
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[GET /api/notifications] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve notifications.' }, { status: 500 });
  }
}

// ─── POST /api/notifications — Create Notification ────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { title, message, type = 'GENERAL' } = body;
    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        title: title.trim(),
        message: message.trim(),
        type,
        isRead: false,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/notifications] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create notification.' }, { status: 500 });
  }
}

// ─── PATCH /api/notifications — Mark As Read ──────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body
    }

    const { id, all } = body;

    if (all) {
      await prisma.notification.updateMany({
        where: { organizationId: user.organizationId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (id) {
      await prisma.notification.updateMany({
        where: { id, organizationId: user.organizationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ error: 'Notification ID or "all" flag is required.' }, { status: 400 });
  } catch (error: any) {
    console.error('[PATCH /api/notifications] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update notification.' }, { status: 500 });
  }
}
