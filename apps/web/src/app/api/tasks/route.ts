import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const tasks = await prisma.task.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[GET /api/tasks] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Task ID and status are required.' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('[PATCH /api/tasks] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
