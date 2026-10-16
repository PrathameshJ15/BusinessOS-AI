import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/analytics — Tenant Smart Links & Conversion Analytics ──────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const organizationId = user.organizationId;

    // Parallel queries scoped strictly to tenant organizationId
    const [
      totalSmartLinks,
      activeSmartLinks,
      smartLinks,
      events,
      campaigns,
    ] = await Promise.all([
      prisma.smartLink.count({
        where: { organizationId },
      }),
      prisma.smartLink.count({
        where: { organizationId, isActive: true },
      }),
      prisma.smartLink.findMany({
        where: { organizationId },
        include: {
          campaign: { select: { id: true, name: true } },
          _count: { select: { events: true } },
        },
        orderBy: { totalClicks: 'desc' },
      }),
      prisma.smartLinkEvent.findMany({
        where: { organizationId },
        include: {
          smartLink: { select: { id: true, name: true, slug: true } },
          campaign: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.campaign.findMany({
        where: { organizationId },
        include: {
          smartLinks: { select: { id: true, slug: true, totalClicks: true } },
          _count: { select: { smartLinkEvents: true } },
        },
      }),
    ]);

    // Calculate aggregated metrics
    let totalVisits = 0;
    let whatsappClicks = 0;
    let bookingClicks = 0;
    let websiteClicks = 0;
    let phoneClicks = 0;

    events.forEach((ev) => {
      switch (ev.eventType) {
        case 'SMART_LINK_VISIT':
          totalVisits++;
          break;
        case 'WHATSAPP_CLICK':
          whatsappClicks++;
          break;
        case 'BOOKING_CLICK':
          bookingClicks++;
          break;
        case 'WEBSITE_CLICK':
          websiteClicks++;
          break;
        case 'PHONE_CLICK':
          phoneClicks++;
          break;
      }
    });

    const totalClicksAcrossLinks = smartLinks.reduce((acc, curr) => acc + (curr.totalClicks || 0), 0);

    const clicksByLink = smartLinks.map((link) => ({
      id: link.id,
      name: link.name,
      slug: link.slug,
      destinationType: link.destinationType,
      destinationValue: link.destinationValue,
      isActive: link.isActive,
      totalClicks: link.totalClicks,
      campaignName: link.campaign?.name || null,
      createdAt: link.createdAt,
    }));

    const clicksByCampaign = campaigns.map((camp) => ({
      id: camp.id,
      name: camp.name,
      channel: camp.channel,
      status: camp.status,
      totalSmartLinks: camp.smartLinks.length,
      totalLinkClicks: camp.smartLinks.reduce((sum, sl) => sum + sl.totalClicks, 0),
      totalEvents: camp._count.smartLinkEvents,
    }));

    const recentEvents = events.slice(0, 20).map((ev) => ({
      id: ev.id,
      eventType: ev.eventType,
      linkName: ev.smartLink?.name || null,
      linkSlug: ev.smartLink?.slug || null,
      campaignName: ev.campaign?.name || null,
      referrerHost: ev.referrerHost,
      createdAt: ev.createdAt,
    }));

    return NextResponse.json({
      summary: {
        totalSmartLinks,
        activeSmartLinks,
        totalClicksAcrossLinks,
        totalVisits,
        whatsappClicks,
        bookingClicks,
        websiteClicks,
        phoneClicks,
      },
      clicksByLink,
      clicksByCampaign,
      recentEvents,
    });
  } catch (error) {
    console.error('[GET /api/analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to aggregate analytics.' }, { status: 500 });
  }
}
