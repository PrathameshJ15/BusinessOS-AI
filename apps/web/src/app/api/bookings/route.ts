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

    const [bookings, services] = await Promise.all([
      prisma.booking.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { startTime: 'asc' },
      }),
      prisma.service.findMany({
        where: { organizationId: user.organizationId },
      }),
    ]);

    return NextResponse.json({ bookings, services });
  } catch (error) {
    console.error('[GET /api/bookings] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const body = await request.json();
    if (!body.customerName || !body.serviceId) {
      return NextResponse.json({ error: 'Customer name and service are required.' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: body.serviceId } });

    const booking = await prisma.booking.create({
      data: {
        organizationId: user.organizationId,
        customerId: body.customerId || 'cust-101',
        customerName: body.customerName,
        customerPhone: body.customerPhone || '+91 90000 00000',
        serviceId: body.serviceId,
        serviceName: service?.name || 'Standard Spa Service',
        staffId: 'stf-1',
        staffName: 'Priya Patel',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        status: 'CONFIRMED',
        paymentStatus: 'UNPAID',
        totalAmount: service?.price || 1499,
        notes: body.notes || 'Booked via Saarthi AI',
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('[POST /api/bookings] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
