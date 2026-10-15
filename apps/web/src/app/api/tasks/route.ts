import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockTasks } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/tasks — Retrieve Tenant Operational Tasks ───────────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let tasks = await prisma.task.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (tasks.length === 0 && user.organizationId === 'org-lumina-101') {
      try {
        await prisma.task.createMany({
          data: mockTasks.map((t) => ({
            organizationId: user.organizationId,
            title: t.title,
            description: t.description,
            status: t.status,
            dueDate: new Date(t.dueDate),
            priority: t.priority,
          })),
        });

        tasks = await prisma.task.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (seedErr) {
        console.warn('[GET /api/tasks] Seed fallback warning:', seedErr);
        tasks = mockTasks.map((t) => ({ ...t, organizationId: user.organizationId })) as any;
      }
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[GET /api/tasks] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve tasks.' }, { status: 500 });
  }
}

// ─── POST /api/tasks — Create New Task ─────────────────────────────────────────

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

    const { title, description = '', priority = 'MEDIUM', dueDate } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        organizationId: user.organizationId,
        title: title.trim(),
        description: description?.trim() || '',
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/tasks] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create task.' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/tasks — Update Task Status with Tenant Isolation Guard ─────────

export async function PATCH(request: NextRequest) {
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

    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: 'Task ID and status are required.' }, { status: 400 });
    }

    // Tenant isolation verification
    const existing = await prisma.task.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Task not found or access denied.' },
        { status: 404 }
      );
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('[PATCH /api/tasks] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task.' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/tasks — Delete Task with Tenant Isolation Guard ───────────────

export async function DELETE(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required.' }, { status: 400 });
    }

    // Tenant isolation verification
    const existing = await prisma.task.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Task not found or access denied.' },
        { status: 404 }
      );
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[DELETE /api/tasks] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete task.' },
      { status: 500 }
    );
  }
}
