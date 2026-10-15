import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockNotes } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/customers/[id]/notes — Fetch customer profile notes ────────────

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required.' }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!customer) {
      // Check if it's a seed customer in mock state
      const seedNotes = mockNotes.filter((n) => n.customerId === id);
      return NextResponse.json(seedNotes);
    }

    // Extract persisted notes from customer tags
    const persistedNotes = customer.tags
      .filter((t) => t.startsWith('__note__:'))
      .map((t) => {
        try {
          return JSON.parse(t.replace('__note__:', ''));
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // If no notes exist yet and customer matches mock data, seed defaults
    if (persistedNotes.length === 0 && user.organizationId === 'org-lumina-101') {
      const fallback = mockNotes.filter((n) => n.customerId === id);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(persistedNotes);
  } catch (error) {
    console.error('[GET /api/customers/:id/notes] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer notes.' }, { status: 500 });
  }
}

// ─── POST /api/customers/[id]/notes — Append customer note ──────────────────

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required.' }, { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json({ error: 'Note content is required.' }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found in this organization.' }, { status: 404 });
    }

    const note = {
      id: `nte-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      organizationId: user.organizationId,
      customerId: id,
      authorName: user.name || 'Team Member',
      content: body.content.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedTags = [...customer.tags, `__note__:${JSON.stringify(note)}`];

    await prisma.customer.update({
      where: { id },
      data: {
        tags: updatedTags,
        lastActivityAt: new Date(),
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('[POST /api/customers/:id/notes] Error:', error);
    return NextResponse.json({ error: 'Failed to save customer note.' }, { status: 500 });
  }
}
