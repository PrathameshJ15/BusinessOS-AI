import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── POST /api/billing/webhook — Razorpay Webhook Event Listener ───────────────

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature') || '';
    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json({ error: 'Empty webhook body.' }, { status: 400 });
    }

    // 1. Verify Webhook Signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Razorpay Webhook] Invalid webhook signature detected.');
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const event = payload.event;
    console.log(`[Razorpay Webhook] Processing event: ${event}`);

    // 2. Handle Events
    switch (event) {
      case 'payment.captured': {
        const payment = payload.payload?.payment?.entity;
        if (payment) {
          const orderId = payment.order_id;
          const paymentId = payment.id;

          if (orderId) {
            await prisma.invoice.updateMany({
              where: { razorpayOrderId: orderId },
              data: {
                status: 'PAID',
                razorpayPaymentId: paymentId,
              },
            });
          }
        }
        break;
      }

      case 'order.paid': {
        const order = payload.payload?.order?.entity;
        if (order) {
          const orderId = order.id;
          await prisma.invoice.updateMany({
            where: { razorpayOrderId: orderId },
            data: { status: 'PAID' },
          });
        }
        break;
      }

      case 'subscription.charged':
      case 'subscription.activated': {
        const sub = payload.payload?.subscription?.entity;
        if (sub) {
          const subId = sub.id;
          const notes = sub.notes || {};
          const organizationId = notes.organizationId;

          if (organizationId) {
            await prisma.subscription.updateMany({
              where: { organizationId },
              data: {
                status: 'ACTIVE',
                razorpaySubscriptionId: subId,
              },
            });
          }
        }
        break;
      }

      default:
        console.log(`[Razorpay Webhook] Unhandled event type: ${event}`);
        break;
    }

    return NextResponse.json({ received: true, event });
  } catch (error: any) {
    console.error('[POST /api/billing/webhook] Webhook Processing Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
