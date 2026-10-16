'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { buildWhatsAppClickToChat, validateWhatsAppPhone } from '@/lib/whatsapp';
import { useApp } from '@/context/AppContext';

export interface WhatsAppDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientPhone: string;
  businessName?: string;
  serviceName?: string;
  onTrackClick?: () => void;
}

export function WhatsAppDraftModal({
  isOpen,
  onClose,
  recipientName,
  recipientPhone,
  businessName = 'Lumina Luxe',
  serviceName = 'Salon & Wellness Services',
  onTrackClick,
}: WhatsAppDraftModalProps) {
  const { language } = useApp();
  const [draftLang, setDraftLang] = useState<'en' | 'hi' | 'mr'>(language || 'en');
  const [messageType, setMessageType] = useState<
    'WELCOME' | 'LEAD_FOLLOWUP' | 'APPOINTMENT_ENQUIRY' | 'PRODUCT_SERVICE' | 'CAMPAIGN_OFFER'
  >('LEAD_FOLLOWUP');
  const [draft, setDraft] = useState(
    `Hi ${recipientName}! Thank you for your interest in ${businessName}. How can we assist you today?`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const phoneValidation = validateWhatsAppPhone(recipientPhone);

  const handleGenerateAiDraft = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/whatsapp-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType,
          customerName: recipientName,
          businessName,
          serviceName,
          language: draftLang,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate AI draft.');
      }

      if (data.draft) {
        setDraft(data.draft);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to AI generator. Using default template.');
      // Multilingual fallback draft based on type and draftLang
      if (draftLang === 'mr') {
        if (messageType === 'WELCOME') {
          setDraft(`नमस्कार ${recipientName}! ${businessName} मध्ये आपले सहर्ष स्वागत आहे. आम्ही आपल्या सेवेसाठी सदैव तत्पर आहोत.`);
        } else if (messageType === 'APPOINTMENT_ENQUIRY') {
          setDraft(`नमस्कार ${recipientName}! या आठवड्यात ${businessName} कडे ${serviceName} साठी वेळ उपलब्ध आहे. आपण अपॉइंटमेंट बुक करू इच्छिता का?`);
        } else if (messageType === 'PRODUCT_SERVICE') {
          setDraft(`नमस्कार ${recipientName}! ${businessName} च्या ${serviceName} सेवेची सर्व माहिती येथे उपलब्ध आहे. काही प्रश्न असल्यास नक्की विचारा!`);
        } else if (messageType === 'CAMPAIGN_OFFER') {
          setDraft(`नमस्कार ${recipientName}! ${businessName} कडून खास ऑफर: ${serviceName} वर मिळवा 20% सूट! ही ऑफर मिळवण्यासाठी लगेच YES उत्तर पाठवा.`);
        } else {
          setDraft(`नमस्कार ${recipientName}! ${businessName} कडून आपल्या चौकशीसंदर्भात संपर्क करत आहोत. आम्ही आपल्याला कशी मदत करू शकतो?`);
        }
      } else if (draftLang === 'hi') {
        if (messageType === 'WELCOME') {
          setDraft(`नमस्ते ${recipientName}! ${businessName} में आपका हार्दिक स्वागत है। हम आपकी सेवा के लिए हमेशा तैयार हैं।`);
        } else if (messageType === 'APPOINTMENT_ENQUIRY') {
          setDraft(`नमस्ते ${recipientName}! ${businessName} में ${serviceName} के लिए इस हफ्ते स्लॉट्स उपलब्ध हैं। क्या आप समय बुक करना चाहेंगे?`);
        } else if (messageType === 'PRODUCT_SERVICE') {
          setDraft(`नमस्ते ${recipientName}! ${businessName} की ${serviceName} सेवा के विवरण यहां हैं। कोई भी सवाल हो तो बेझिझक पूछें!`);
        } else if (messageType === 'CAMPAIGN_OFFER') {
          setDraft(`नमस्ते ${recipientName}! ${businessName} की तरफ से विशेष ऑफर: ${serviceName} पर पाएं 20% की छूट! ऑफर पाने के लिए YES रिप्लाई करें।`);
        } else {
          setDraft(`नमस्ते ${recipientName}! ${businessName} से आपकी पूछताछ के संबंध में संपर्क कर रहे हैं। हम आपकी क्या सहायता कर सकते हैं?`);
        }
      } else {
        if (messageType === 'WELCOME') {
          setDraft(`Hello ${recipientName}! Welcome to ${businessName}. We are delighted to have you with us. Let us know if you need anything!`);
        } else if (messageType === 'APPOINTMENT_ENQUIRY') {
          setDraft(`Hi ${recipientName}! We have open slots for ${serviceName} this week at ${businessName}. Would you like to reserve a time?`);
        } else if (messageType === 'PRODUCT_SERVICE') {
          setDraft(`Hi ${recipientName}! Here are our popular packages for ${serviceName} at ${businessName}. Feel free to ask any questions!`);
        } else if (messageType === 'CAMPAIGN_OFFER') {
          setDraft(`Hi ${recipientName}! Exclusive offer for you at ${businessName}: get 20% off your next ${serviceName}. Reply YES to claim!`);
        } else {
          setDraft(`Hi ${recipientName}! Following up from ${businessName} regarding your recent inquiry. How can we help?`);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clickToChatUrl = phoneValidation.isValid
    ? buildWhatsAppClickToChat(recipientPhone, draft)
    : '';

  const handleOpenWhatsApp = () => {
    if (onTrackClick) onTrackClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-zinc-900 dark:text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                WhatsApp Direct Messenger
              </h3>
              <p className="text-[11px] text-zinc-400">
                To: <span className="font-semibold text-zinc-200">{recipientName}</span> ({phoneValidation.formatted || recipientPhone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phone validation warning if invalid */}
        {!phoneValidation.isValid && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{phoneValidation.error || 'Please provide a valid 10-15 digit phone number.'}</span>
          </div>
        )}

        {/* Message Type Selector & Language Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Select Message Context
            </label>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              {[
                { code: 'en', label: 'ENG' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'mr', label: 'मराठी' },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setDraftLang(l.code as any)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    draftLang === l.code
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            {[
              { id: 'LEAD_FOLLOWUP', label: 'Lead Follow-up' },
              { id: 'APPOINTMENT_ENQUIRY', label: 'Appointment' },
              { id: 'CAMPAIGN_OFFER', label: 'Offer / Promo' },
              { id: 'WELCOME', label: 'Welcome Note' },
              { id: 'PRODUCT_SERVICE', label: 'Service Info' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMessageType(item.id as any)}
                className={`p-2 rounded-xl border text-left font-semibold transition-all ${
                  messageType === item.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Generator Trigger */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-400">AI Context: {businessName}</span>
          <button
            type="button"
            onClick={handleGenerateAiDraft}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isGenerating ? 'Drafting with AI...' : 'Generate AI Draft'}</span>
          </button>
        </div>

        {error && (
          <p className="text-[11px] text-amber-500 italic">{error}</p>
        )}

        {/* Editable Message Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Message Content (Editable Review)
            </label>
            <span className="text-[10px] text-zinc-400 font-mono">
              {draft.length} chars
            </span>
          </div>
          <textarea
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your WhatsApp message..."
            className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-[1.65] font-multilingual"
          />
        </div>

        {/* Compliance Notice */}
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2 text-[11px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Clicking below opens WhatsApp with your prefilled message. Messages are not automatically sent; you review and press send manually in WhatsApp.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>

            {phoneValidation.isValid ? (
              <a
                href={clickToChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenWhatsApp}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl cursor-not-allowed"
              >
                Invalid Phone
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
