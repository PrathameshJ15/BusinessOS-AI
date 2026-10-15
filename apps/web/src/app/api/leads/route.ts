import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockLeads } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/leads — Fetch organization pipeline leads ───────────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let leads = await prisma.lead.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    // If demo tenant has no leads in DB yet, seed initial mock leads
    if (leads.length === 0 && user.organizationId === 'org-lumina-101') {
      try {
        await prisma.lead.createMany({
          data: mockLeads.map((l) => ({
            organizationId: user.organizationId,
            name: l.name,
            email: l.email,
            phone: l.phone,
            source: l.source,
            stage: l.stage,
            estimatedValue: l.estimatedValue,
            notes: l.notes || null,
          })),
          skipDuplicates: true,
        });

        leads = await prisma.lead.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (seedErr) {
        console.error('[GET /api/leads] Seed fallback error:', seedErr);
      }
    }

    return NextResponse.json(leads);
  } catch (error) {
    console.error('[GET /api/leads] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pipeline leads.' }, { status: 500 });
  }
}

// ─── POST /api/leads — Register new pipeline lead ─────────────────────────────

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

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Lead name is required.' }, { status: 400 });
    }

    if (!body.phone || typeof body.phone !== 'string' || !body.phone.trim()) {
      return NextResponse.json({ error: 'Lead phone number is required.' }, { status: 400 });
    }

    const estimatedValue = Number(body.estimatedValue) || 0;
    const source = (body.source || 'WEBSITE').toUpperCase();
    const stage = (body.stage || 'NEW').toUpperCase();

    const lead = await prisma.lead.create({
      data: {
        organizationId: user.organizationId,
        name: body.name.trim(),
        email: body.email?.trim() || `${body.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@lead.example.com`,
        phone: body.phone.trim(),
        source,
        stage,
        estimatedValue,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('[POST /api/leads] Error:', error);
    return NextResponse.json({ error: 'Failed to create lead.' }, { status: 500 });
  }
}
