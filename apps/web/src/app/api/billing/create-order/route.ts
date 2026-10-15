import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createRazorpayOrder, getRazorpayConfig } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── POST /api/billing/create-order — Razorpay Order Creation ─────────────────

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

    const amount = Number(body.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required.' }, { status: 400 });
    }

    const plan = body.plan || 'PRO';
    const customerName = body.customerName || user.name || 'Business Owner';
    const customerEmail = body.customerEmail || user.email || 'billing@businessos.app';
    const invoiceNumber = body.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create Razorpay order (real or sandbox simulation)
    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `rcpt_${invoiceNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
      notes: {
        organizationId: user.organizationId,
        userEmail: user.email,
        plan,
      },
    });

    // 2. Create corresponding Invoice in Neon DB
    const tax = Math.round(amount * 0.18); // 18% GST standard in India
    const total = amount + tax;

    const invoice = await prisma.invoice.create({
      data: {
        organizationId: user.organizationId,
        invoiceNumber,
        customerName,
        customerEmail,
        amount,
        tax,
        total,
        currency: 'INR',
        status: 'UNPAID',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        razorpayOrderId: razorpayOrder.id,
      },
    });

    const config = getRazorpayConfig();

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise for Razorpay Checkout
      currency: razorpayOrder.currency,
      keyId: razorpayOrder.key_id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      mode: config.mode,
    });
  } catch (error: any) {
    console.error('[POST /api/billing/create-order] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment order.' }, { status: 500 });
  }
}
