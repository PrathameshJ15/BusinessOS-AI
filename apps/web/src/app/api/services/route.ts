import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockServices } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/services — List organization services ─────────────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let services = await prisma.service.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });

    if (services.length === 0 && user.organizationId === 'org-lumina-101') {
      try {
        await prisma.service.createMany({
          data: mockServices.map((s) => ({
            organizationId: user.organizationId,
            name: s.name,
            description: s.description,
            category: s.category,
            durationMinutes: s.durationMinutes,
            price: s.price,
            isActive: s.isActive ?? true,
          })),
          skipDuplicates: true,
        });

        services = await prisma.service.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { name: 'asc' },
        });
      } catch (seedErr) {
        console.error('[GET /api/services] Seed fallback error:', seedErr);
      }
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('[GET /api/services] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch services.' }, { status: 500 });
  }
}

// ─── POST /api/services — Register new service offering ─────────────────────

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
      return NextResponse.json({ error: 'Service name is required.' }, { status: 400 });
    }

    const price = Number(body.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Valid service price is required.' }, { status: 400 });
    }

    const durationMinutes = Number(body.durationMinutes) || 60;
    const category = body.category?.trim() || 'General';
    const description = body.description?.trim() || `${body.name} professional service.`;

    const service = await prisma.service.create({
      data: {
        organizationId: user.organizationId,
        name: body.name.trim(),
        description,
        category,
        durationMinutes,
        price,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('[POST /api/services] Error:', error);
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 });
  }
}
