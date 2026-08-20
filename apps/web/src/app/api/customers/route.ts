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

    const customers = await prisma.customer.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('[GET /api/customers] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const body = await request.json();
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required.' }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        organizationId: user.organizationId,
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone.trim(),
        tags: body.tags || ['New Client'],
        status: 'ACTIVE',
        lifetimeValue: body.lifetimeValue || 0,
        totalBookings: 1,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('[POST /api/customers] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
