import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockStaff } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/staff — List organization staff members ───────────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let staff = await prisma.staff.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });

    if (staff.length === 0 && user.organizationId === 'org-lumina-101') {
      try {
        await prisma.staff.createMany({
          data: mockStaff.map((s) => ({
            organizationId: user.organizationId,
            name: s.name,
            role: s.role,
            email: s.email,
            phone: s.phone,
            avatarUrl: s.avatarUrl || null,
            isAvailable: s.isAvailable ?? true,
          })),
          skipDuplicates: true,
        });

        staff = await prisma.staff.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { name: 'asc' },
        });
      } catch (seedErr) {
        console.error('[GET /api/staff] Seed fallback error:', seedErr);
      }
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error('[GET /api/staff] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff members.' }, { status: 500 });
  }
}

// ─── POST /api/staff — Register new staff member ────────────────────────────

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
      return NextResponse.json({ error: 'Staff member name is required.' }, { status: 400 });
    }

    if (!body.phone || typeof body.phone !== 'string' || !body.phone.trim()) {
      return NextResponse.json({ error: 'Staff phone number is required.' }, { status: 400 });
    }

    const role = body.role?.trim() || 'Therapist';
    const email = body.email?.trim() || `${body.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@businessos.app`;

    const staffMember = await prisma.staff.create({
      data: {
        organizationId: user.organizationId,
        name: body.name.trim(),
        role,
        email,
        phone: body.phone.trim(),
        avatarUrl: body.avatarUrl || null,
        isAvailable: body.isAvailable !== false,
      },
    });

    return NextResponse.json(staffMember, { status: 201 });
  } catch (error) {
    console.error('[POST /api/staff] Error:', error);
    return NextResponse.json({ error: 'Failed to create staff member.' }, { status: 500 });
  }
}
