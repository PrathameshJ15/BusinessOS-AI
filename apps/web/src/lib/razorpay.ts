import crypto from 'node:crypto';

export interface RazorpayOrderPayload {
  amount: number; // in INR rupees
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: 'order';
  amount: number; // in paise (e.g. 299900)
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
  key_id: string;
}

export function getRazorpayConfig() {
  const mode = process.env.RAZORPAY_MODE || 'SIMULATION';
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated_key_123';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_simulated_secret_456';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_whsec_simulated_secret_789';

  const isRealCredentials =
    keyId &&
    keySecret &&
    !keyId.includes('simulated') &&
    keyId.startsWith('rzp_') &&
    mode !== 'SIMULATION';

  return {
    mode,
    keyId,
    keySecret,
    webhookSecret,
    isRealCredentials: Boolean(isRealCredentials),
  };
}

/**
 * Creates a Razorpay order either via direct REST API or simulated sandbox order.
 */
export async function createRazorpayOrder(
  payload: RazorpayOrderPayload
): Promise<RazorpayOrderResponse> {
  const config = getRazorpayConfig();
  const amountInPaise = Math.round(payload.amount * 100);
  const receipt = payload.receipt || `rcpt_${Date.now()}`;
  const currency = payload.currency || 'INR';

  if (config.isRealCredentials) {
    const authHeader = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        notes: payload.notes || {},
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.description || 'Failed to create Razorpay live order');
    }

    const orderData = await res.json();
    return {
      ...orderData,
      key_id: config.keyId,
    };
  }

  // Deterministic Sandbox / Simulation Order
  const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: simulatedOrderId,
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
    key_id: config.keyId,
  };
}

/**
 * Validates Razorpay payment signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const config = getRazorpayConfig();

  // Sandbox simulation override
  if (!config.isRealCredentials) {
    if (signature.startsWith('sim_sig_') || signature === 'valid_sandbox_signature') {
      return true;
    }
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', config.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Validates Razorpay Webhook signature: HMAC-SHA256(rawBody, webhookSecret)
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const config = getRazorpayConfig();

  if (!config.isRealCredentials && (signature === 'valid_sandbox_webhook' || signature.startsWith('wh_sim_'))) {
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
