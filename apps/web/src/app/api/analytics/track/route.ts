import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_EVENT_TYPES = new Set([
  'SMART_LINK_VISIT',
  'WHATSAPP_CLICK',
  'BOOKING_CLICK',
  'WEBSITE_CLICK',
  'PHONE_CLICK',
]);

// ─── POST /api/analytics/track — Client & Public Event Ingestion ─────────────

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const {
      eventType,
      smartLinkId,
      siteSlug,
      campaignId,
      referrerHost,
    } = body;

    if (!eventType || !VALID_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ error: 'Invalid or missing eventType.' }, { status: 400 });
    }

    let organizationId: string | null = null;
    let resolvedCampaignId: string | null = campaignId || null;

    // 1. Resolve organization via smartLinkId
    if (smartLinkId) {
      const link = await prisma.smartLink.findUnique({
        where: { id: smartLinkId },
        select: { organizationId: true, campaignId: true },
      });
      if (link) {
        organizationId = link.organizationId;
        if (!resolvedCampaignId && link.campaignId) {
          resolvedCampaignId = link.campaignId;
        }
      }
    }

    // 2. Resolve organization via siteSlug
    if (!organizationId && siteSlug) {
      const cleanSlug = String(siteSlug).toLowerCase().trim();
      const site = await prisma.website.findFirst({
        where: { subdomain: cleanSlug },
        select: { organizationId: true },
      });
      if (site) {
        organizationId = site.organizationId;
      }
    }

    // 3. Fallback to active authenticated user session if available
    if (!organizationId) {
      try {
        const activeEmailHeader = request.headers.get('x-saarthi-user-email');
        const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
        const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);
        organizationId = user.organizationId;
      } catch {
        // Anonymous visitor without siteSlug or smartLinkId
      }
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Unable to identify tenant organization for event.' }, { status: 422 });
    }

    // Record Event in Neon DB
    const event = await prisma.smartLinkEvent.create({
      data: {
        organizationId,
        smartLinkId: smartLinkId || null,
        campaignId: resolvedCampaignId,
        eventType,
        referrerHost: referrerHost ? String(referrerHost).slice(0, 200) : null,
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('[POST /api/analytics/track] Error:', error);
    return NextResponse.json({ error: 'Failed to record tracking event.' }, { status: 500 });
  }
}
