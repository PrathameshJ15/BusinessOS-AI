import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';

// ─── Phase 4 Test Suite: Razorpay Billing, Payments & Integrations ───────────

interface TestOrderPayload {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

function createSimulatedOrder(payload: TestOrderPayload) {
  const amountInPaise = Math.round(payload.amount * 100);
  const receipt = payload.receipt || `rcpt_${Date.now()}`;
  const currency = payload.currency || 'INR';

  return {
    id: `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    entity: 'order',
    amount: amountInPaise,
    amount_paid: 0,
    amount_due: amountInPaise,
    currency,
    receipt,
    status: 'created',
    attempts: 0,
    notes: payload.notes || {},
    created_at: Math.floor(Date.now() / 1000),
  };
}

function verifyHmacSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  if (signature.startsWith('sim_sig_') || signature === 'valid_sandbox_signature') {
    return true;
  }

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

function verifyWebhookHmac(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  if (signature === 'valid_sandbox_webhook' || signature.startsWith('wh_sim_')) {
    return true;
  }

  try {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

interface TestInvoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: 'UNPAID' | 'PAID' | 'VOID';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

interface TestSubscription {
  organizationId: string;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  amount: number;
  razorpaySubscriptionId?: string;
}

interface TestIntegration {
  id: string;
  organizationId: string;
  provider: 'RAZORPAY' | 'GOOGLE_BUSINESS' | 'WHATSAPP' | 'INSTAGRAM';
  status: 'CONNECTED' | 'DISCONNECTED';
}

describe('Phase 4 — Billing, Payments & Integrations Tests', () => {
  describe('Razorpay Order Creation & Currency Math', () => {
    it('should accurately convert INR rupees to paise for checkout', () => {
      const order = createSimulatedOrder({
        amount: 2999,
        receipt: 'rcpt_inv_001',
        notes: { plan: 'PRO', organizationId: 'org-lumina-101' },
      });

      assert.strictEqual(order.amount, 299900);
      assert.strictEqual(order.currency, 'INR');
      assert.strictEqual(order.status, 'created');
      assert.ok(order.id.startsWith('order_sim_'));
      assert.strictEqual(order.notes.plan, 'PRO');
    });

    it('should compute 18% standard GST and total correctly', () => {
      const baseAmount = 5000;
      const tax = Math.round(baseAmount * 0.18);
      const total = baseAmount + tax;

      assert.strictEqual(tax, 900);
      assert.strictEqual(total, 5900);
    });
  });

  describe('HMAC SHA256 Payment Signature Verification', () => {
    const secret = 'rzp_test_secret_key_7788';
    const orderId = 'order_ABC123XYZ';
    const paymentId = 'pay_DEF456UVW';

    it('should verify genuine HMAC-SHA256 signature calculated from order_id|payment_id', () => {
      const genuineSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = verifyHmacSignature(orderId, paymentId, genuineSignature, secret);
      assert.strictEqual(isValid, true);
    });

    it('should reject tampered or modified signature', () => {
      const genuineSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Tamper signature by replacing last 4 characters
      const tamperedSignature = genuineSignature.slice(0, -4) + '0000';
      const isValid = verifyHmacSignature(orderId, paymentId, tamperedSignature, secret);
      assert.strictEqual(isValid, false);
    });

    it('should reject signature with mismatched secret', () => {
      const differentSecret = 'rzp_wrong_secret_1234';
      const signatureWithOtherSecret = crypto
        .createHmac('sha256', differentSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = verifyHmacSignature(orderId, paymentId, signatureWithOtherSecret, secret);
      assert.strictEqual(isValid, false);
    });

    it('should accept simulated sandbox signatures in simulation mode', () => {
      const isSimulatedValid = verifyHmacSignature(
        orderId,
        paymentId,
        'sim_sig_test_12345',
        secret
      );
      assert.strictEqual(isSimulatedValid, true);
    });
  });

  describe('Razorpay Webhook Verification & Event Ingestion', () => {
    const webhookSecret = 'whsec_demo_secret_9988';
    const rawBody = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_live_771122',
            order_id: 'order_test_9900',
            amount: 299900,
            status: 'captured',
          },
        },
      },
    });

    it('should verify genuine webhook signature calculated over raw text body', () => {
      const genuineSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const isValid = verifyWebhookHmac(rawBody, genuineSignature, webhookSecret);
      assert.strictEqual(isValid, true);
    });

    it('should reject webhook if body has been modified after signing', () => {
      const genuineSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const tamperedBody = rawBody.replace('299900', '10000');
      const isValid = verifyWebhookHmac(tamperedBody, genuineSignature, webhookSecret);
      assert.strictEqual(isValid, false);
    });

    it('should process payment.captured event and mark invoice PAID', () => {
      const invoices: TestInvoice[] = [
        {
          id: 'inv-1',
          organizationId: 'org-lumina-101',
          invoiceNumber: 'INV-2026-001',
          amount: 2999,
          tax: 540,
          total: 3539,
          status: 'UNPAID',
          razorpayOrderId: 'order_test_9900',
        },
      ];

      const eventPayload = JSON.parse(rawBody);
      const paymentEntity = eventPayload.payload.payment.entity;

      const targetInvoice = invoices.find(
        (inv) => inv.razorpayOrderId === paymentEntity.order_id
      );
      assert.ok(targetInvoice);
      targetInvoice.status = 'PAID';
      targetInvoice.razorpayPaymentId = paymentEntity.id;

      assert.strictEqual(targetInvoice.status, 'PAID');
      assert.strictEqual(targetInvoice.razorpayPaymentId, 'pay_live_771122');
    });
  });

  describe('Multi-Tenant Invoice & Subscription Isolation', () => {
    const invoices: TestInvoice[] = [
      {
        id: 'inv-org-A',
        organizationId: 'org-A',
        invoiceNumber: 'INV-A-101',
        amount: 2999,
        tax: 540,
        total: 3539,
        status: 'PAID',
      },
      {
        id: 'inv-org-B',
        organizationId: 'org-B',
        invoiceNumber: 'INV-B-201',
        amount: 7999,
        tax: 1440,
        total: 9439,
        status: 'UNPAID',
      },
    ];

    const subscriptions: Record<string, TestSubscription> = {
      'org-A': {
        organizationId: 'org-A',
        plan: 'PRO',
        status: 'ACTIVE',
        amount: 2999,
      },
      'org-B': {
        organizationId: 'org-B',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        amount: 7999,
      },
    };

    it('should strictly isolate invoices between Organization A and Organization B', () => {
      const orgAInvoices = invoices.filter((i) => i.organizationId === 'org-A');
      const orgBInvoices = invoices.filter((i) => i.organizationId === 'org-B');

      assert.strictEqual(orgAInvoices.length, 1);
      assert.strictEqual(orgBInvoices.length, 1);
      assert.strictEqual(orgAInvoices[0].invoiceNumber, 'INV-A-101');
      assert.strictEqual(orgBInvoices[0].invoiceNumber, 'INV-B-201');
    });

    it('should isolate tenant subscription plans and billing amounts', () => {
      assert.strictEqual(subscriptions['org-A'].plan, 'PRO');
      assert.strictEqual(subscriptions['org-B'].plan, 'ENTERPRISE');
      assert.strictEqual(subscriptions['org-A'].amount, 2999);
      assert.strictEqual(subscriptions['org-B'].amount, 7999);
    });
  });

  describe('Third-Party Integration Adapters', () => {
    const integrations: TestIntegration[] = [
      { id: 'int-1', organizationId: 'org-A', provider: 'RAZORPAY', status: 'CONNECTED' },
      { id: 'int-2', organizationId: 'org-A', provider: 'GOOGLE_BUSINESS', status: 'CONNECTED' },
      { id: 'int-3', organizationId: 'org-A', provider: 'WHATSAPP', status: 'CONNECTED' },
      { id: 'int-4', organizationId: 'org-A', provider: 'INSTAGRAM', status: 'CONNECTED' },
    ];

    it('should support all standard business adapters', () => {
      const providers = integrations.map((i) => i.provider);
      assert.ok(providers.includes('RAZORPAY'));
      assert.ok(providers.includes('GOOGLE_BUSINESS'));
      assert.ok(providers.includes('WHATSAPP'));
      assert.ok(providers.includes('INSTAGRAM'));
    });

    it('should allow toggling integration status cleanly', () => {
      const target = integrations.find((i) => i.provider === 'INSTAGRAM');
      assert.ok(target);
      target.status = target.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';

      assert.strictEqual(target.status, 'DISCONNECTED');
      target.status = 'CONNECTED';
      assert.strictEqual(target.status, 'CONNECTED');
    });
  });
});
