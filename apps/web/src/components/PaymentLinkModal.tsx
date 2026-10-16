'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Receipt,
  Share2,
  Smartphone,
  Building2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { validateWhatsAppPhone, buildWhatsAppClickToChat } from '@/lib/whatsapp';

export interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: {
    id: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    totalAmount: number;
    paymentStatus?: string;
  } | null;
  customerName?: string;
  customerPhone?: string;
  serviceName?: string;
  amount?: number;
}

export function PaymentLinkModal({
  isOpen,
  onClose,
  booking,
  customerName,
  customerPhone,
  serviceName,
  amount,
}: PaymentLinkModalProps) {
  const { verifyPayment, updateBookingPaymentStatus, addToast, session } = useApp();

  const activeCustomer = booking?.customerName || customerName || 'Valued Client';
  const activePhone = booking?.customerPhone || customerPhone || '+91 98000 00000';
  const activeService = booking?.serviceName || serviceName || 'Selected Service';
  const rawAmount = booking?.totalAmount ?? amount ?? 1500;
  const taxAmount = Math.round(rawAmount * 0.18);
  const totalAmount = rawAmount + taxAmount;

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    keyId: string;
    mode: string;
  } | null>(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(booking?.paymentStatus === 'PAID');
  const [paidPaymentId, setPaidPaymentId] = useState('');
  const [simulationMethod, setSimulationMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [error, setError] = useState<string | null>(null);

  // Generate Razorpay Order when modal opens
  useEffect(() => {
    if (!isOpen) {
      setOrderData(null);
      setPaymentUrl('');
      setIsPaid(false);
      setPaidPaymentId('');
      setError(null);
      return;
    }

    if (booking?.paymentStatus === 'PAID') {
      setIsPaid(true);
      return;
    }

    async function initOrder() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/billing/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-saarthi-user-email': session.userEmail,
          },
          body: JSON.stringify({
            amount: rawAmount,
            customerName: activeCustomer,
            customerEmail: 'client@example.com',
            plan: 'SERVICE_BOOKING',
          }),
        });

        let data: any = null;
        try {
          if (res.ok) {
            data = await res.json();
          } else {
            const text = await res.text();
            try {
              data = JSON.parse(text);
            } catch {
              // Non-JSON response (e.g. HTML error page)
            }
          }
        } catch {
          // JSON parsing failed
        }

        if (!data || !data.orderId) {
          // Resilient fallback sandbox order
          data = {
            orderId: `order_sim_${Date.now()}`,
            invoiceId: `inv-${Date.now()}`,
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            amount: totalAmount * 100,
            keyId: 'rzp_test_simulated_key_123',
            mode: 'SIMULATION',
          };
        }

        setOrderData(data);

        // Build the public customer payment URL
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const queryParams = new URLSearchParams({
          orderId: data.orderId,
          invoiceId: data.invoiceId || '',
          invoiceNumber: data.invoiceNumber || '',
          amount: String(totalAmount),
          customer: activeCustomer,
          service: activeService,
          bookingId: booking?.id || '',
        });

        const generatedUrl = `${origin}/pay?${queryParams.toString()}`;
        setPaymentUrl(generatedUrl);
      } catch (err: any) {
        console.error('[PaymentLinkModal] Order init fallback:', err);
        // Fallback local order
        const fallbackOrderId = `order_sim_${Date.now()}`;
        const fallbackData = {
          orderId: fallbackOrderId,
          invoiceId: `inv-${Date.now()}`,
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: totalAmount * 100,
          keyId: 'rzp_test_simulated_key_123',
          mode: 'SIMULATION',
        };
        setOrderData(fallbackData);
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        setPaymentUrl(`${origin}/pay?orderId=${fallbackOrderId}&amount=${totalAmount}&customer=${encodeURIComponent(activeCustomer)}&service=${encodeURIComponent(activeService)}&bookingId=${booking?.id || ''}`);
      } finally {
        setIsLoading(false);
      }
    }

    initOrder();
  }, [isOpen, booking, rawAmount, activeCustomer, activeService, totalAmount, session.userEmail]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!paymentUrl) return;
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    addToast({ type: 'success', title: 'Link Copied', message: 'Payment link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const message = `Hi ${activeCustomer}! Here is your secure Razorpay payment link for ${activeService} (₹${totalAmount.toLocaleString()} incl. GST): ${paymentUrl} - ${session.organizationName || 'Lumina Luxe'}`;
    const cleanPhone = activePhone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`;
    const waUrl = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSimulatePayment = async () => {
    if (!orderData) return;
    setIsVerifying(true);
    setError(null);
    try {
      const simPaymentId = `pay_sim_${Date.now()}`;
      const success = await verifyPayment({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: simPaymentId,
        razorpay_signature: 'valid_sandbox_signature',
        invoiceId: orderData.invoiceId,
        bookingId: booking?.id,
        isSubscriptionPayment: false,
      });

      if (success) {
        setIsPaid(true);
        setPaidPaymentId(simPaymentId);
        if (booking?.id) {
          updateBookingPaymentStatus(booking.id, 'PAID');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Simulation verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Razorpay Payment Link</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  ⚡ Sandbox Mode
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Generate shareable payment links & simulate instant customer checkout.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paid Success Banner */}
        {isPaid ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Payment Received & Verified!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                Amount of ₹{totalAmount.toLocaleString()} marked as <strong>PAID</strong> in database.
              </p>
              {paidPaymentId && (
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-500 mt-1">
                  Razorpay Payment ID: {paidPaymentId}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Close & Return to Appointments
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Loading Order */}
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-semibold text-zinc-500">Creating Razorpay Order & Invoice...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            ) : (
              <>
                {/* Invoice Breakdown Card */}
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white block">{activeCustomer}</span>
                      <span className="text-[11px] text-zinc-500">{activePhone} · {activeService}</span>
                    </div>
                    {orderData && (
                      <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded font-mono text-[10px]">
                        {orderData.invoiceNumber}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-700 text-xs space-y-1.5">
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <span>Service Fee</span>
                      <span>₹{rawAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <span>GST (18%)</span>
                      <span>₹{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-900 dark:text-white text-sm pt-1 border-t border-zinc-200 dark:border-zinc-700">
                      <span>Total Payable</span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {orderData && (
                    <div className="text-[10px] font-mono text-zinc-400 truncate">
                      Razorpay Order ID: {orderData.orderId}
                    </div>
                  )}
                </div>

                {/* Shareable Link Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Customer Payment Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={paymentUrl}
                      className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      title="Copy Payment Link"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Share & Open actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      className="p-2.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send via WhatsApp</span>
                    </button>

                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      title="Open customer checkout page in a separate tab to simulate payment"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Open Separate Pay Page</span>
                    </a>
                  </div>
                </div>

                {/* Instant Sandbox Simulation Box */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        Sandbox Fast Simulation
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      HMAC-SHA256
                    </span>
                  </div>

                  {/* Simulation Method Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSimulationMethod('card')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        simulationMethod === 'card'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimulationMethod('upi')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        simulationMethod === 'upi'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimulationMethod('netbanking')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        simulationMethod === 'netbanking'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <Building2 className="w-3 h-3" />
                      <span>Bank</span>
                    </button>
                  </div>

                  {/* Active Simulation Preview */}
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-600 dark:text-zinc-300">
                    {simulationMethod === 'card' && (
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Simulated Card:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          Visa 4111 •••• 4444 (12/28)
                        </span>
                      </div>
                    )}
                    {simulationMethod === 'upi' && (
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Simulated VPA:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          client@okhdfcbank
                        </span>
                      </div>
                    )}
                    {simulationMethod === 'netbanking' && (
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Simulated Bank:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          HDFC Bank Instant Debit
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isVerifying || !orderData}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Sandbox Signature...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          Simulate Payment via {simulationMethod === 'card' ? 'Card' : simulationMethod === 'upi' ? 'UPI' : 'Bank'} (₹{totalAmount.toLocaleString()})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
