import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { Plan } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── POST /api/billing/verify — Razorpay Payment Verification & Activation ────

export async function POST(request: NextRequest) {
  try {
    let user: any = null;
    try {
      const activeEmailHeader = request.headers.get('x-saarthi-user-email');
      const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
      user = await getServerUser(activeEmailHeader || cookieEmail || undefined);
    } catch {
      // Public customer checkout context - no session required
      user = { organizationId: 'org-lumina-101' };
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      invoiceId,
      bookingId,
      isSubscriptionPayment = false,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required Razorpay payment verification parameters.' },
        { status: 400 }
      );
    }

    // 1. Verify Payment Signature using HMAC-SHA256
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Untrusted or tampered payload.' },
        { status: 400 }
      );
    }

    // 2. Mark Invoice as PAID in Neon DB if invoiceId or razorpay_order_id matches
    let updatedInvoice = null;
    try {
      if (invoiceId) {
        updatedInvoice = await prisma.invoice.updateMany({
          where: {
            id: invoiceId,
          },
          data: {
            status: 'PAID',
            razorpayPaymentId: razorpay_payment_id,
          },
        });
      } else if (razorpay_order_id) {
        updatedInvoice = await prisma.invoice.updateMany({
          where: {
            razorpayOrderId: razorpay_order_id,
          },
          data: {
            status: 'PAID',
            razorpayPaymentId: razorpay_payment_id,
          },
        });
      }
    } catch (invErr) {
      console.warn('[POST /api/billing/verify] Could not update invoice in DB:', invErr);
    }

    // 3. Mark Booking as PAID if bookingId provided
    if (bookingId) {
      try {
        await prisma.booking.updateMany({
          where: {
            id: bookingId,
          },
          data: {
            paymentStatus: 'PAID',
          },
        });
      } catch (bkErr) {
        console.warn('[POST /api/billing/verify] Could not update booking in DB:', bkErr);
      }
    }

    // 4. Update or Upsert Subscription in Neon DB only if this is a subscription checkout
    const planEnum = (plan && plan.toUpperCase() in Plan ? plan.toUpperCase() : 'PRO') as Plan;
    let updatedSubscription = null;
    if (isSubscriptionPayment && plan) {
      const planAmounts: Record<string, number> = {
        FREE: 0,
        STARTER: 999,
        PRO: 2999,
        ENTERPRISE: 7999,
      };
      const amount = planAmounts[planEnum] || 2999;

      try {
        updatedSubscription = await prisma.subscription.upsert({
          where: { organizationId: user.organizationId },
          update: {
            plan: planEnum,
            status: 'ACTIVE',
            amount,
            currency: 'INR',
            razorpaySubscriptionId: razorpay_payment_id,
          },
          create: {
            organizationId: user.organizationId,
            plan: planEnum,
            status: 'ACTIVE',
            amount,
            currency: 'INR',
            razorpaySubscriptionId: razorpay_payment_id,
          },
        });
      } catch (subErr) {
        console.warn('[POST /api/billing/verify] Could not upsert subscription in DB:', subErr);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      plan: planEnum,
      status: 'ACTIVE',
      subscription: updatedSubscription,
      invoiceUpdated: Boolean(updatedInvoice),
    });
  } catch (error: any) {
    console.error('[POST /api/billing/verify] Verification Error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
