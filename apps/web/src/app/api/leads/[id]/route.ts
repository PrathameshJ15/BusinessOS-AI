import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── PATCH /api/leads/[id] — Update lead stage, notes, or details ─────────────

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required.' }, { status: 400 });
    }

    // Verify lead exists and belongs to current user's organization
    const existing = await prisma.lead.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Lead not found in this organization.' }, { status: 404 });
    }

    const body = await request.json();
    const dataToUpdate: any = {};

    if (body.stage) dataToUpdate.stage = body.stage.toUpperCase();
    if (body.estimatedValue !== undefined) dataToUpdate.estimatedValue = Number(body.estimatedValue);
    if (body.notes !== undefined) dataToUpdate.notes = body.notes;
    if (body.name) dataToUpdate.name = body.name.trim();
    if (body.email) dataToUpdate.email = body.email.trim();
    if (body.phone) dataToUpdate.phone = body.phone.trim();
    if (body.source) dataToUpdate.source = body.source.toUpperCase();

    const updated = await prisma.lead.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/leads/:id] Error:', error);
    return NextResponse.json({ error: 'Failed to update lead.' }, { status: 500 });
  }
}

// ─── DELETE /api/leads/[id] — Delete lead ─────────────────────────────────────

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const { id } = params;
    const existing = await prisma.lead.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('[DELETE /api/leads/:id] Error:', error);
    return NextResponse.json({ error: 'Failed to delete lead.' }, { status: 500 });
  }
}
