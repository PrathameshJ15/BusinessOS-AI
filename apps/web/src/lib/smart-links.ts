/**
 * BusinessOS AI — Smart Business Links & Redirect Security
 *
 * Enforces strict destination validation, prevents open redirects,
 * and normalizes smart links for multi-tenant organizations.
 */

import { SmartLinkDestinationType } from '@businessos/shared';
import { validateWhatsAppPhone, buildWhatsAppClickToChat } from './whatsapp';

export const RESERVED_SLUGS = new Set([
  'api',
  'login',
  'onboarding',
  'dashboard',
  'site',
  'go',
  'admin',
  'settings',
  'auth',
  'health',
  'favicon.ico',
  '_next',
  'static',
]);

export interface SlugValidationResult {
  isValid: boolean;
  slug: string;
  error?: string;
}

export function validateSmartSlug(rawSlug: string): SlugValidationResult {
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

export interface DestinationValidationResult {
  isValid: boolean;
  destinationUrl: string;
  destinationType: SmartLinkDestinationType;
  error?: string;
}

/**
 * Validates destination URLs against open redirect attacks and unsafe schemes.
 * Only allows trusted destination types and validated protocols.
 */
export function validateDestination(
  type: SmartLinkDestinationType,
  value: string,
  siteSlug?: string
): DestinationValidationResult {
  if (!value || typeof value !== 'string') {
    return { isValid: false, destinationUrl: '', destinationType: type, error: 'Destination is required.' };
  }

  const trimmed = value.trim();

  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
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
      destinationType: type,
      error: 'Unsafe destination protocol detected. Target must be a valid web or contact URL.',
    };
  }

  switch (type) {
    case 'WHATSAPP': {
      if (lower.startsWith('https://wa.me/') || lower.startsWith('http://wa.me/')) {
        return { isValid: true, destinationUrl: trimmed, destinationType: 'WHATSAPP' };
      }
      const phoneVal = validateWhatsAppPhone(trimmed);
      if (!phoneVal.isValid) {
        return {
          isValid: false,
          destinationUrl: '',
          destinationType: 'WHATSAPP',
          error: phoneVal.error || 'Invalid WhatsApp number.',
        };
      }
      return {
        isValid: true,
        destinationUrl: buildWhatsAppClickToChat(phoneVal.normalized),
        destinationType: 'WHATSAPP',
      };
    }

    case 'PHONE': {
      const phoneVal = validateWhatsAppPhone(trimmed);
      if (!phoneVal.isValid && !lower.startsWith('tel:')) {
        return {
          isValid: false,
          destinationUrl: '',
          destinationType: 'PHONE',
          error: 'Invalid telephone number.',
        };
      }
      const dest = lower.startsWith('tel:') ? trimmed : `tel:+${phoneVal.normalized}`;
      return { isValid: true, destinationUrl: dest, destinationType: 'PHONE' };
    }

    case 'BOOKING': {
      if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
        return { isValid: true, destinationUrl: trimmed, destinationType: 'BOOKING' };
      }
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return { isValid: true, destinationUrl: parsed.toString(), destinationType: 'BOOKING' };
        }
      } catch {}
      return {
        isValid: true,
        destinationUrl: siteSlug ? `/site/${siteSlug}#book` : '/dashboard/bookings',
        destinationType: 'BOOKING',
      };
    }

    case 'WEBSITE': {
      if (trimmed.startsWith('/')) {
        return { isValid: true, destinationUrl: trimmed, destinationType: 'WEBSITE' };
      }
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return { isValid: true, destinationUrl: parsed.toString(), destinationType: 'WEBSITE' };
        }
      } catch {}
      return {
        isValid: true,
        destinationUrl: siteSlug ? `/site/${siteSlug}` : `/site/lumina-luxe`,
        destinationType: 'WEBSITE',
      };
    }

    case 'CUSTOM_URL':
    default: {
      if (trimmed.startsWith('/')) {
        return { isValid: true, destinationUrl: trimmed, destinationType: 'CUSTOM_URL' };
      }
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return {
            isValid: false,
            destinationUrl: '',
            destinationType: 'CUSTOM_URL',
            error: 'Custom URLs must use http:// or https:// protocol.',
          };
        }
        return { isValid: true, destinationUrl: parsed.toString(), destinationType: 'CUSTOM_URL' };
      } catch {
        return {
          isValid: false,
          destinationUrl: '',
          destinationType: 'CUSTOM_URL',
          error: 'Please enter a valid URL (e.g. https://example.com).',
        };
      }
    }
  }
}
