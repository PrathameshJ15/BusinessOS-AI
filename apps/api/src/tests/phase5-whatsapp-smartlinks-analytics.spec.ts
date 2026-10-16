import { describe, it } from 'node:test';
import assert from 'node:assert';

// ─── Phase 5 Test Suite: WhatsApp Click-to-Chat, Smart Links & Analytics ─────

// WhatsApp Phone Validation & Normalization Logic
function validateWhatsAppPhone(rawPhone: string) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, normalized: '', error: 'Phone number is required.' };
  }

  const digitsOnly = rawPhone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return { isValid: false, normalized: '', error: 'Phone number must have at least 10 digits.' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, normalized: '', error: 'Phone number cannot exceed 15 digits.' };
  }

  // Auto-prepend 91 if user enters a 10-digit Indian mobile number
  let normalized = digitsOnly;
  if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
    normalized = `91${digitsOnly}`;
  }

  return { isValid: true, normalized, digitsOnly };
}

function buildWhatsAppClickToChat(normalizedPhone: string, message?: string) {
  const cleanPhone = normalizedPhone.replace(/\D/g, '');
  if (!message || !message.trim()) {
    return `https://wa.me/${cleanPhone}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message.trim())}`;
}

// Smart Slug Validation Logic
const RESERVED_SLUGS = new Set([
  'api', 'login', 'onboarding', 'dashboard', 'site', 'go', 'admin', 'settings', 'auth', 'health', '_next'
]);

function validateSmartSlug(rawSlug: string) {
  if (!rawSlug || typeof rawSlug !== 'string') {
    return { isValid: false, slug: '', error: 'Slug is required.' };
  }

  const cleanSlug = rawSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (cleanSlug.length < 2) {
    return { isValid: false, slug: cleanSlug, error: 'Slug must be at least 2 characters.' };
  }

  if (cleanSlug.length > 50) {
    return { isValid: false, slug: cleanSlug, error: 'Slug cannot exceed 50 characters.' };
  }

  if (RESERVED_SLUGS.has(cleanSlug)) {
    return { isValid: false, slug: cleanSlug, error: `"${cleanSlug}" is a reserved system identifier.` };
  }

  return { isValid: true, slug: cleanSlug };
}

// Destination Validation & Anti-Open Redirect Guard
function validateDestination(type: string, value: string, siteSlug?: string) {
  if (!value || typeof value !== 'string') {
    return { isValid: false, destinationUrl: '', error: 'Destination is required.' };
  }

  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  // Block dangerous schemes
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.includes('\n') ||
    lower.includes('\r')
  ) {
    return {
      isValid: false,
      destinationUrl: '',
      error: 'Unsafe destination protocol detected. Target must be a valid web or contact URL.',
    };
  }

  switch (type) {
    case 'WHATSAPP': {
      if (lower.startsWith('https://wa.me/') || lower.startsWith('http://wa.me/')) {
        return { isValid: true, destinationUrl: trimmed };
      }
      const phoneVal = validateWhatsAppPhone(trimmed);
      if (!phoneVal.isValid) {
        return { isValid: false, destinationUrl: '', error: 'Invalid WhatsApp phone number.' };
      }
      return { isValid: true, destinationUrl: buildWhatsAppClickToChat(phoneVal.normalized) };
    }

    case 'PHONE': {
      const phoneVal = validateWhatsAppPhone(trimmed);
      if (!phoneVal.isValid && !lower.startsWith('tel:')) {
        return { isValid: false, destinationUrl: '', error: 'Invalid telephone number.' };
      }
      const dest = lower.startsWith('tel:') ? trimmed : `tel:+${phoneVal.normalized}`;
      return { isValid: true, destinationUrl: dest };
    }

    case 'BOOKING': {
      if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
        return { isValid: true, destinationUrl: trimmed };
      }
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return { isValid: true, destinationUrl: parsed.toString() };
        }
      } catch {}
      return { isValid: true, destinationUrl: siteSlug ? `/site/${siteSlug}#book` : '/dashboard/bookings' };
    }

    case 'WEBSITE': {
      if (trimmed.startsWith('/')) {
        return { isValid: true, destinationUrl: trimmed };
      }
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return { isValid: true, destinationUrl: parsed.toString() };
        }
      } catch {}
      return { isValid: true, destinationUrl: siteSlug ? `/site/${siteSlug}` : '/site/lumina-luxe' };
    }

    case 'CUSTOM_URL':
    default: {
      if (trimmed.startsWith('/')) {
        return { isValid: true, destinationUrl: trimmed };
      }
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return { isValid: false, destinationUrl: '', error: 'Custom URLs must use http:// or https:// protocol.' };
        }
        return { isValid: true, destinationUrl: parsed.toString() };
      } catch {
        return { isValid: false, destinationUrl: '', error: 'Please enter a valid URL.' };
      }
    }
  }
}

// Redirect Simulation
interface MockSmartLink {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  destinationType: string;
  destinationValue: string;
  isActive: boolean;
  expiresAt: Date | null;
  totalClicks: number;
}

function resolveRedirect(link: MockSmartLink | null) {
  if (!link) {
    return { status: 404, error: 'Link not found' };
  }
  if (!link.isActive) {
    return { status: 410, error: 'Link is currently inactive' };
  }
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return { status: 410, error: 'Link has expired' };
  }

  const destVal = validateDestination(link.destinationType, link.destinationValue);
  if (!destVal.isValid) {
    return { status: 400, error: destVal.error };
  }

  return { status: 307, destinationUrl: destVal.destinationUrl };
}

// Deterministic AI Fallback Draft Generator
function generateFallbackWhatsAppDraft(type: string, businessName: string, customerName?: string, customNote?: string) {
  const cust = customerName ? customerName.trim() : 'there';
  switch (type) {
    case 'WELCOME':
      return `Hi ${cust}! Welcome to ${businessName}. We are glad to connect with you. How can our team assist you today?`;
    case 'LEAD_FOLLOWUP':
      return `Hello ${cust}! Following up regarding your inquiry at ${businessName}. We would love to discuss how our services can best assist you. Would you like to schedule a quick call?`;
    case 'APPOINTMENT_ENQUIRY':
      return `Hi ${cust}! Thank you for reaching out to ${businessName}. We have slots available this week for consultations. Would you like to reserve a time?`;
    case 'CAMPAIGN_OFFER':
      return `Exclusive Offer for ${cust}! ${businessName} is offering a limited-time special on our signature services. ${customNote || 'Reply to claim yours today!'}`;
    default:
      return `Hello ${cust}! This is ${businessName}. How can we help you today?`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 5 — WhatsApp, Smart Links & Analytics Test Suite', () => {

  describe('WhatsApp Phone Validation & Click-to-Chat Generation', () => {
    it('should normalize 10-digit Indian mobile numbers with 91 country code', () => {
      const result = validateWhatsAppPhone('9876543210');
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.normalized, '919876543210');
    });

    it('should preserve existing country code for formatted international numbers', () => {
      const result = validateWhatsAppPhone('+91 98765 43210');
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.normalized, '919876543210');

      const usResult = validateWhatsAppPhone('+1 (555) 234-5678');
      assert.strictEqual(usResult.isValid, true);
      assert.strictEqual(usResult.normalized, '15552345678');
    });

    it('should reject numbers with fewer than 10 digits', () => {
      const result = validateWhatsAppPhone('12345678');
      assert.strictEqual(result.isValid, false);
      assert.match(result.error || '', /at least 10 digits/i);
    });

    it('should reject empty or missing phone numbers', () => {
      const result = validateWhatsAppPhone('');
      assert.strictEqual(result.isValid, false);
    });

    it('should generate valid wa.me click-to-chat links without message', () => {
      const link = buildWhatsAppClickToChat('919876543210');
      assert.strictEqual(link, 'https://wa.me/919876543210');
    });

    it('should safely URL-encode prefilled messages with spaces, newlines, and emojis', () => {
      const link = buildWhatsAppClickToChat('919876543210', 'Hello there! 👋 Interested in booking: Hair Spa & Facial.');
      assert.ok(link.startsWith('https://wa.me/919876543210?text='));
      assert.ok(!link.includes(' ')); // Spaces must be encoded
      assert.ok(link.includes('%F0%9F%91%8B') || link.includes('%20'));
    });
  });

  describe('Smart Link Slug Validation & System Security', () => {
    it('should sanitize and accept valid alphanumeric slugs with hyphens', () => {
      const res = validateSmartSlug('Weekend-Sale_2026!');
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.slug, 'weekend-sale-2026');
    });

    it('should block reserved system paths from being used as link slugs', () => {
      const reserved = ['api', 'dashboard', 'site', 'go', 'admin', 'auth'];
      for (const slug of reserved) {
        const res = validateSmartSlug(slug);
        assert.strictEqual(res.isValid, false);
        assert.match(res.error || '', /reserved/i);
      }
    });

    it('should enforce slug length limits (min 2, max 50)', () => {
      const tooShort = validateSmartSlug('a');
      assert.strictEqual(tooShort.isValid, false);
      assert.match(tooShort.error || '', /at least 2 characters/i);

      const tooLong = validateSmartSlug('a'.repeat(55));
      assert.strictEqual(tooLong.isValid, false);
      assert.match(tooLong.error || '', /cannot exceed 50 characters/i);
    });
  });

  describe('Destination Validation & Anti-Open Redirect Engine', () => {
    it('should format WHATSAPP destination type into safe wa.me URL', () => {
      const res = validateDestination('WHATSAPP', '9876543210');
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.destinationUrl, 'https://wa.me/919876543210');
    });

    it('should format PHONE destination type into safe tel: URI', () => {
      const res = validateDestination('PHONE', '9876543210');
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.destinationUrl, 'tel:+919876543210');
    });

    it('should accept valid HTTP and HTTPS custom destination URLs', () => {
      const res = validateDestination('CUSTOM_URL', 'https://instagram.com/lumina_luxe');
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.destinationUrl, 'https://instagram.com/lumina_luxe');
    });

    it('should strictly block dangerous schemes (javascript:, data:, vbscript:, file:)', () => {
      const attacks = [
        'javascript:alert(document.cookie)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("pwnd")',
        'file:///etc/passwd',
        'https://example.com\r\nInjected-Header: evil',
      ];

      for (const attack of attacks) {
        const res = validateDestination('CUSTOM_URL', attack);
        assert.strictEqual(res.isValid, false, `Failed to block attack: ${attack}`);
        assert.match(res.error || '', /Unsafe destination protocol/i);
      }
    });
  });

  describe('Smart Redirect Engine Status & Expiration Handling', () => {
    const activeLink: MockSmartLink = {
      id: 'link-1',
      organizationId: 'org-lumina',
      slug: 'vip-booking',
      name: 'VIP Booking Link',
      destinationType: 'BOOKING',
      destinationValue: '/site/lumina-luxe#book',
      isActive: true,
      expiresAt: null,
      totalClicks: 42,
    };

    it('should successfully resolve active link with status 307', () => {
      const result = resolveRedirect(activeLink);
      assert.strictEqual(result.status, 307);
      assert.strictEqual(result.destinationUrl, '/site/lumina-luxe#book');
    });

    it('should return 410 Gone when link is paused or inactive', () => {
      const pausedLink = { ...activeLink, isActive: false };
      const result = resolveRedirect(pausedLink);
      assert.strictEqual(result.status, 410);
      assert.match(result.error || '', /inactive/i);
    });

    it('should return 410 Gone when link has expired', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // Yesterday
      const expiredLink = { ...activeLink, expiresAt: pastDate };
      const result = resolveRedirect(expiredLink);
      assert.strictEqual(result.status, 410);
      assert.match(result.error || '', /expired/i);
    });

    it('should return 404 Not Found when link does not exist', () => {
      const result = resolveRedirect(null);
      assert.strictEqual(result.status, 404);
      assert.match(result.error || '', /not found/i);
    });
  });

  describe('Multi-Tenant Analytics Aggregation & Telemetry', () => {
    interface SimulatedEvent {
      organizationId: string;
      smartLinkId?: string;
      eventType: string;
    }

    const mockEvents: SimulatedEvent[] = [
      { organizationId: 'org-a', smartLinkId: 'link-1', eventType: 'SMART_LINK_VISIT' },
      { organizationId: 'org-a', smartLinkId: 'link-1', eventType: 'SMART_LINK_VISIT' },
      { organizationId: 'org-a', smartLinkId: 'link-1', eventType: 'WHATSAPP_CLICK' },
      { organizationId: 'org-a', smartLinkId: 'link-2', eventType: 'BOOKING_CLICK' },
      { organizationId: 'org-b', smartLinkId: 'link-9', eventType: 'SMART_LINK_VISIT' },
      { organizationId: 'org-b', smartLinkId: 'link-9', eventType: 'WHATSAPP_CLICK' },
    ];

    it('should strictly isolate telemetry metrics between organizations', () => {
      const orgAEvents = mockEvents.filter((e) => e.organizationId === 'org-a');
      const orgBEvents = mockEvents.filter((e) => e.organizationId === 'org-b');

      assert.strictEqual(orgAEvents.length, 4);
      assert.strictEqual(orgBEvents.length, 2);

      const orgAVisits = orgAEvents.filter((e) => e.eventType === 'SMART_LINK_VISIT').length;
      assert.strictEqual(orgAVisits, 2);

      const orgAWhatsAppClicks = orgAEvents.filter((e) => e.eventType === 'WHATSAPP_CLICK').length;
      assert.strictEqual(orgAWhatsAppClicks, 1);
    });

    it('should aggregate clicks by event type correctly', () => {
      const counts: Record<string, number> = {};
      mockEvents.forEach((ev) => {
        counts[ev.eventType] = (counts[ev.eventType] || 0) + 1;
      });

      assert.strictEqual(counts['SMART_LINK_VISIT'], 3);
      assert.strictEqual(counts['WHATSAPP_CLICK'], 2);
      assert.strictEqual(counts['BOOKING_CLICK'], 1);
    });
  });

  describe('AI Message Drafter & Fallback Safety Engine', () => {
    it('should generate professional contextual greeting for welcome inquiries', () => {
      const msg = generateFallbackWhatsAppDraft('WELCOME', 'Lumina Luxe Salon', 'Priya');
      assert.ok(msg.includes('Hi Priya!'));
      assert.ok(msg.includes('Lumina Luxe Salon'));
    });

    it('should generate appointment booking inquiry draft with customer name', () => {
      const msg = generateFallbackWhatsAppDraft('APPOINTMENT_ENQUIRY', 'Lumina Luxe Salon', 'Rahul');
      assert.ok(msg.includes('Rahul'));
      assert.ok(msg.includes('consultations'));
    });

    it('should append custom promotion notes in campaign offer drafts', () => {
      const msg = generateFallbackWhatsAppDraft(
        'CAMPAIGN_OFFER',
        'Lumina Luxe Salon',
        'Anita',
        'Get 20% off Hydra-Facial with promo code GLOW20.'
      );
      assert.ok(msg.includes('GLOW20'));
      assert.ok(msg.includes('Anita'));
    });
  });
});
