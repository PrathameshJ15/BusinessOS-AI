/**
 * BusinessOS AI — WhatsApp & Click-to-Chat Utilities
 * 
 * Provides phone number normalization, E.164 compliance, URL encoding,
 * and context-specific message generators for customer interactions.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // Digits only, with country code (e.g., "919876543210")
  formatted: string;  // Human-readable format (e.g., "+91 98765 43210")
  error?: string;
}

/**
 * Validates and normalizes phone numbers for WhatsApp click-to-chat (wa.me).
 * Supports Indian (10 digits -> adds 91) and international numbers (10-15 digits).
 */
export function validateWhatsAppPhone(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalized: '', formatted: '', error: 'Phone number is required.' };
  }

  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    return { isValid: false, normalized: '', formatted: '', error: 'Phone number must contain digits.' };
  }

  let normalized = digits;

  // Handle common Indian phone conventions
  if (digits.length === 10) {
    // 10 digits without country code -> default to India (+91)
    normalized = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    // 0-prefixed 10 digits -> strip 0, prepend 91
    normalized = `91${digits.slice(1)}`;
  } else if (digits.length < 10) {
    return {
      isValid: false,
      normalized: digits,
      formatted: phone,
      error: 'Phone number is too short (minimum 10 digits with country code).',
    };
  } else if (digits.length > 15) {
    return {
      isValid: false,
      normalized: digits,
      formatted: phone,
      error: 'Phone number exceeds maximum international standard (15 digits).',
    };
  }

  // Format nicely for human display
  const formatted = `+${normalized.slice(0, normalized.length - 10)} ${normalized.slice(-10, -5)} ${normalized.slice(-5)}`;

  return {
    isValid: true,
    normalized,
    formatted,
  };
}

/**
 * Generates a safe, URL-encoded WhatsApp click-to-chat destination URL.
 * Never executes arbitrary scripts or redirects.
 */
export function buildWhatsAppClickToChat(phone: string, message?: string): string {
  const validation = validateWhatsAppPhone(phone);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid phone number for WhatsApp link.');
  }

  const baseUrl = `https://wa.me/${validation.normalized}`;
  if (!message || !message.trim()) {
    return baseUrl;
  }

  return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
}

export type WhatsAppMessageContext =
  | 'WEBSITE_VISITOR'
  | 'APPOINTMENT_ENQUIRY'
  | 'LEAD_FOLLOWUP'
  | 'PRODUCT_SERVICE'
  | 'CAMPAIGN_OFFER'
  | 'GENERAL';

export interface WhatsAppMessageOptions {
  type: WhatsAppMessageContext;
  businessName?: string;
  customerName?: string;
  serviceName?: string;
  offerDetails?: string;
  appointmentTime?: string;
  customNote?: string;
}

/**
 * Builds prefilled message templates customized with authorized business and customer context.
 */
export function buildWhatsAppMessage(options: WhatsAppMessageOptions): string {
  const {
    type,
    businessName = 'your business',
    customerName,
    serviceName,
    offerDetails,
    appointmentTime,
    customNote,
  } = options;

  const greeting = customerName ? `Hi ${customerName}!` : 'Hello!';

  switch (type) {
    case 'WEBSITE_VISITOR':
      return `Hi! I visited ${businessName} website and would like to know more about your services.`;

    case 'APPOINTMENT_ENQUIRY':
      if (serviceName && appointmentTime) {
        return `${greeting} I would like to check availability for ${serviceName} around ${appointmentTime} at ${businessName}.`;
      }
      if (serviceName) {
        return `${greeting} I would like to book an appointment for ${serviceName} at ${businessName}.`;
      }
      return `${greeting} I would like to book an appointment at ${businessName}.`;

    case 'LEAD_FOLLOWUP':
      return `${greeting} Thank you for your interest in ${businessName}. How can we assist you today?`;

    case 'PRODUCT_SERVICE':
      return `${greeting} Could you share more details and pricing for ${serviceName || 'your services'}?`;

    case 'CAMPAIGN_OFFER':
      return `${greeting} I would like to claim the promotional offer: ${offerDetails || 'special discount'} at ${businessName}.`;

    case 'GENERAL':
    default:
      return customNote || `Hi! I am contacting ${businessName} regarding your services.`;
  }
}
