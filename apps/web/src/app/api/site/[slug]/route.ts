import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseStoredBlocks } from '@/lib/website-storage';
import { mockWebsite, mockServices } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/site/[slug] — Public website data resolver ──────────────────────

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const slug = resolvedParams?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Subdomain slug is required.' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim();

    // 1. Look up published website in Neon database
    let site = await prisma.website.findFirst({
      where: {
        subdomain: cleanSlug,
        isPublished: true,
      },
    });

    // Fallback for default demo slug
    if (!site && (cleanSlug === 'lumina-luxe' || cleanSlug === 'lumina')) {
      site = await prisma.website.findFirst({
        where: { subdomain: 'lumina-luxe' },
      });
    }

    if (!site) {
      const fallbackBlocks = [
        {
          id: 'blk-1',
          type: 'HERO',
          title: 'Experience Pure Radiance & Bespoke Luxury',
          content: {
            heading: 'Experience Pure Radiance & Bespoke Luxury',
            subheading: 'Hyderabad’s premier destination for advanced clinical skincare, precision hair styling, and holistic spa wellness.',
            ctaText: 'Reserve Your Visit',
            ctaLink: '#book',
          },
        },
        {
          id: 'blk-2',
          type: 'SERVICES',
          title: 'Signature Aesthetic & Wellness Treatments',
          content: {
            heading: 'Signature Aesthetic & Wellness Treatments',
            subheading: 'Crafted by world-class aestheticians using clinical-grade organic formulations.',
            ctaText: 'Explore Full Menu',
          },
        },
        {
          id: 'blk-3',
          type: 'FEATURES',
          title: 'Why Discerning Clients Choose Lumina Luxe',
          content: {
            heading: 'Why Discerning Clients Choose Lumina Luxe',
            subheading: 'US-FDA approved laser aesthetic tech, private VIP therapy suites, and 100% cruelty-free botanical serums.',
          },
        },
        {
          id: 'blk-4',
          type: 'TESTIMONIALS',
          title: 'Over 120+ 5-Star Verified Google Reviews',
          content: {
            heading: 'Over 120+ 5-Star Verified Google Reviews',
            subheading: 'Rated 4.9★ by our valued clientele for exceptional hygiene, personalized consultation, and stellar results.',
          },
        },
        {
          id: 'blk-5',
          type: 'CONTACT',
          title: 'Visit Our Sanctuary in Jubilee Hills',
          content: {
            heading: 'Visit Our Sanctuary in Jubilee Hills',
            subheading: 'Road No. 36, Jubilee Hills, Hyderabad · Open 7 Days a Week: 10:00 AM – 9:00 PM · Complimentary Valet Parking.',
            ctaText: 'Get Directions on Maps',
          },
        },
      ];

      return NextResponse.json({
        site: {
          id: 'site-mock-fallback',
          subdomain: cleanSlug,
          domainName: `${cleanSlug}.businessos.in`,
          businessName: 'Lumina Luxe Salon & Wellness',
          tagline: 'Premier Aesthetic Care & Luxury Spa Sanctuary',
          phone: '+91 98200 12345',
          email: 'concierge@luminaluxe.in',
          address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
          themeColor: '#059669',
          fontFamily: 'Plus Jakarta Sans',
          isPublished: true,
          blocks: fallbackBlocks,
          services: mockServices,
          whatsappSettings: {
            phoneNumber: '+919820012345',
            ctaLabel: 'Chat with Concierge',
            visitorMessage: 'Hi Lumina Luxe team, I would like to book a consultation!',
          },
        },
      });
    }

    // 2. Fetch business name, offerings, and WhatsApp settings for this organization
    const org = await prisma.organization.findUnique({
      where: { id: site.organizationId },
      include: {
        services: {
          where: { isActive: true },
          take: 6,
        },
        whatsappSettings: true,
      },
    });

    const parsedBlocks = parseStoredBlocks(site.fontFamily);
    const businessName = org?.name || 'Lumina Luxe Salon & Wellness';

    const cleanFont = (site.fontFamily || 'Inter').split(':::')[0] || 'Inter';

    const whatsappSettings = org?.whatsappSettings && org.whatsappSettings.isEnabled
      ? {
          phoneNumber: org.whatsappSettings.phoneNumber,
          ctaLabel: org.whatsappSettings.defaultCtaLabel || 'Chat on WhatsApp',
          visitorMessage: org.whatsappSettings.visitorMessage || 'Hi! I visited your website and would like to know more about your services.',
        }
      : null;

    return NextResponse.json({
      site: {
        id: site.id,
        subdomain: site.subdomain,
        domainName: site.domainName,
        businessName,
        themeColor: site.themeColor || '#0F172A',
        fontFamily: cleanFont,
        isPublished: site.isPublished,
        blocks: parsedBlocks,
        services: org?.services && org.services.length > 0 ? org.services : mockServices,
        whatsappSettings,
      },
    });
  } catch (error) {
    console.error('[GET /api/site/[slug]] Error:', error);
    return NextResponse.json({ error: 'Failed to resolve site details.' }, { status: 500 });
  }
}

// ─── POST /api/site/[slug] — Public website lead capture form submission ───────

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const slug = resolvedParams?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Subdomain slug is required.' }, { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    if (!body.phone && !body.email) {
      return NextResponse.json({ error: 'Either email or phone is required.' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim();

    // Find the organization owning this subdomain
    const site = await prisma.website.findFirst({
      where: { subdomain: cleanSlug },
    });

    if (!site) {
      return NextResponse.json({ error: 'Website not found.' }, { status: 404 });
    }

    // Persist new inbound lead into Neon DB
    const lead = await prisma.lead.create({
      data: {
        organizationId: site.organizationId,
        name: body.name.trim(),
        email: body.email?.trim() || 'inquiry@website.com',
        phone: body.phone?.trim() || '+91 00000 00000',
        source: 'WEBSITE',
        stage: 'NEW',
        estimatedValue: body.servicePrice ? Number(body.servicePrice) : 2500,
        notes: body.message?.trim() || `Inbound website inquiry via /site/${site.subdomain}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry received. The business team will get in touch shortly.',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('[POST /api/site/[slug]] Error:', error);
    return NextResponse.json({ error: 'Failed to process lead inquiry.' }, { status: 500 });
  }
}
