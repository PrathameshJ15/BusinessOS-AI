import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockInvoices, mockSubscription } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/billing — Retrieve Organization Subscription & Invoices ─────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    // 1. Fetch Subscription
    let subscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
    });

    if (!subscription) {
      // Seed default PRO subscription in Neon DB
      try {
        subscription = await prisma.subscription.create({
          data: {
            organizationId: user.organizationId,
            plan: 'PRO',
            status: 'ACTIVE',
            amount: 2999,
            currency: 'INR',
            razorpaySubscriptionId: `sub_${user.organizationId.slice(0, 10)}`,
          },
        });
      } catch {
        // Fallback
        subscription = {
          id: `sub-${user.organizationId}`,
          organizationId: user.organizationId,
          plan: 'PRO' as any,
          status: 'ACTIVE',
          amount: 2999,
          currency: 'INR',
          razorpaySubscriptionId: 'sub_fallback',
        };
      }
    }

    // 2. Fetch Invoices
    let invoices = await prisma.invoice.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    // Seed initial invoices if none exist
    if (invoices.length === 0 && user.organizationId === 'org-lumina-101') {
      try {
        await prisma.invoice.createMany({
          data: mockInvoices.map((inv) => ({
            organizationId: user.organizationId,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            customerEmail: inv.customerEmail,
            amount: inv.amount,
            tax: inv.tax,
            total: inv.total,
            currency: inv.currency,
            status: inv.status,
            dueDate: new Date(inv.dueDate),
            razorpayOrderId: inv.razorpayOrderId || null,
            razorpayPaymentId: inv.razorpayPaymentId || null,
          })),
        });

        invoices = await prisma.invoice.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (seedErr) {
        console.warn('[GET /api/billing] Failed to seed demo invoices:', seedErr);
        invoices = mockInvoices as any;
      }
    }

    return NextResponse.json({
      subscription,
      invoices,
    });
  } catch (error) {
    console.error('[GET /api/billing] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve billing information.' }, { status: 500 });
  }
}
