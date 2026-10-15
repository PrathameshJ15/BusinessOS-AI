import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockIntegrations } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/integrations — Retrieve Connected Integrations ─────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let integrations = await prisma.integration.findMany({
      where: { organizationId: user.organizationId },
    });

    if (integrations.length === 0) {
      // Seed default integrations into Neon DB for the tenant
      const defaultProviders = ['RAZORPAY', 'GOOGLE_BUSINESS', 'WHATSAPP', 'INSTAGRAM'];
      try {
        await prisma.integration.createMany({
          data: defaultProviders.map((provider) => ({
            organizationId: user.organizationId,
            provider,
            status: 'CONNECTED',
          })),
        });

        integrations = await prisma.integration.findMany({
          where: { organizationId: user.organizationId },
        });
      } catch (seedErr) {
        console.warn('[GET /api/integrations] Failed to seed integrations in DB:', seedErr);
        integrations = mockIntegrations.map((item) => ({
          ...item,
          organizationId: user.organizationId,
        })) as any;
      }
    }

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('[GET /api/integrations] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve integrations.' },
      { status: 500 }
    );
  }
}

// ─── POST /api/integrations — Connect / Disconnect / Update Integration ───────

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

    const { provider, status = 'CONNECTED' } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Integration provider name is required.' }, { status: 400 });
    }

    // Find existing integration for this provider and organization
    const existing = await prisma.integration.findFirst({
      where: {
        organizationId: user.organizationId,
        provider,
      },
    });

    let integration;
    if (existing) {
      integration = await prisma.integration.update({
        where: { id: existing.id },
        data: { status },
      });
    } else {
      integration = await prisma.integration.create({
        data: {
          organizationId: user.organizationId,
          provider,
          status,
        },
      });
    }

    return NextResponse.json({
      success: true,
      integration,
    });
  } catch (error: any) {
    console.error('[POST /api/integrations] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update integration.' },
      { status: 500 }
    );
  }
}
