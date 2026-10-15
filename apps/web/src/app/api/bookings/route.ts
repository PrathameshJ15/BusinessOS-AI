import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockStaff } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/bookings — Fetch organization appointments, services & staff ──

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let [bookings, services, staff] = await Promise.all([
      prisma.booking.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { startTime: 'asc' },
      }),
      prisma.service.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { name: 'asc' },
      }),
      prisma.staff.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Demo tenant fallback for staff if not yet populated
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
        console.error('[GET /api/bookings] Staff seed fallback error:', seedErr);
      }
    }

    return NextResponse.json({ bookings, services, staff });
  } catch (error) {
    console.error('[GET /api/bookings] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve bookings.' }, { status: 500 });
  }
}

// ─── POST /api/bookings — Schedule appointment with conflict detection ──────

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

    if (!body.customerName || !body.serviceId) {
      return NextResponse.json({ error: 'Customer name and service offering are required.' }, { status: 400 });
    }

    // Resolve Service Offering
    const service = await prisma.service.findFirst({
      where: { id: body.serviceId, organizationId: user.organizationId },
    });

    const serviceName = service?.name || body.serviceName || 'Standard Service';
    const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : (service?.price || 1499);
    const durationMinutes = service?.durationMinutes || 60;

    // Resolve Staff Member
    let resolvedStaffId = body.staffId;
    let resolvedStaffName = body.staffName;

    if (resolvedStaffId) {
      const dbStaff = await prisma.staff.findFirst({
        where: { id: resolvedStaffId, organizationId: user.organizationId },
      });
      if (dbStaff) {
        resolvedStaffName = dbStaff.name;
      }
    }

    if (!resolvedStaffId || !resolvedStaffName) {
      const firstStaff = await prisma.staff.findFirst({
        where: { organizationId: user.organizationId, isAvailable: true },
      });
      resolvedStaffId = firstStaff?.id || 'stf-1';
      resolvedStaffName = firstStaff?.name || 'Priya Patel';
    }

    // Parse Appointment Timestamps
    let startDateTime: Date;
    if (body.startTime) {
      startDateTime = new Date(body.startTime);
      if (isNaN(startDateTime.getTime())) {
        startDateTime = new Date();
      }
    } else {
      startDateTime = new Date();
    }

    let endDateTime: Date;
    if (body.endTime) {
      endDateTime = new Date(body.endTime);
      if (isNaN(endDateTime.getTime())) {
        endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
      }
    } else {
      endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
    }

    // ─── Slot Conflict Detection ──────────────────────────────────────────
    // Prevent double-booking for the same staff member within the same organization
    const conflict = await prisma.booking.findFirst({
      where: {
        organizationId: user.organizationId,
        staffId: resolvedStaffId,
        status: { notIn: ['CANCELLED', 'REJECTED'] },
        AND: [
          { startTime: { lt: endDateTime } },
          { endTime: { gt: startDateTime } },
        ],
      },
    });

    if (conflict) {
      const conflictStartStr = conflict.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const conflictEndStr = conflict.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return NextResponse.json(
        {
          error: `Appointment Conflict: Staff member "${resolvedStaffName}" is already scheduled for "${conflict.serviceName}" between ${conflictStartStr} and ${conflictEndStr}. Please choose another time slot or staff member.`,
          conflictId: conflict.id,
        },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        organizationId: user.organizationId,
        customerId: body.customerId || 'cust-101',
        customerName: body.customerName.trim(),
        customerPhone: body.customerPhone?.trim() || '+91 90000 00000',
        serviceId: body.serviceId,
        serviceName,
        staffId: resolvedStaffId,
        staffName: resolvedStaffName,
        startTime: startDateTime,
        endTime: endDateTime,
        status: body.status || 'CONFIRMED',
        paymentStatus: body.paymentStatus || 'UNPAID',
        totalAmount,
        notes: body.notes?.trim() || 'Booked via Saarthi AI Smart Scheduler',
      },
    });

    // If customer exists in DB, update their visit count and last activity
    if (body.customerId) {
      try {
        await prisma.customer.updateMany({
          where: { id: body.customerId, organizationId: user.organizationId },
          data: {
            totalBookings: { increment: 1 },
            lastActivityAt: new Date(),
          },
        });
      } catch (custErr) {
        console.error('[POST /api/bookings] Customer update non-fatal error:', custErr);
      }
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('[POST /api/bookings] Error:', error);
    return NextResponse.json({ error: 'Failed to create booking appointment.' }, { status: 500 });
  }
}
