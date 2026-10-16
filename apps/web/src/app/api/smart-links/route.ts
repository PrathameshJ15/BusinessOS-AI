import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateSmartSlug, validateDestination } from '@/lib/smart-links';
import { SmartLinkDestinationType } from '@businessos/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/smart-links — List all links for the tenant ────────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const links = await prisma.smartLink.findMany({
      where: { organizationId: user.organizationId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            channel: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('[GET /api/smart-links] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve smart links.' }, { status: 500 });
  }
}

// ─── POST /api/smart-links — Create a new smart link ─────────────────────────

export async function POST(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const {
      name,
      slug,
      destinationType,
      destinationValue,
      campaignId,
      expiresAt,
      isActive = true,
    } = body;

    // 1. Validate Name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Link name is required.' }, { status: 400 });
    }

    // 2. Validate Slug
    const slugValidation = validateSmartSlug(slug);
    if (!slugValidation.isValid) {
      return NextResponse.json(
        { error: slugValidation.error || 'Invalid slug provided.' },
        { status: 400 }
      );
    }

    // 3. Check Slug Uniqueness across all organizations
    const existing = await prisma.smartLink.findUnique({
      where: { slug: slugValidation.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: `The slug "${slugValidation.slug}" is already in use. Please select a unique slug.` },
        { status: 409 }
      );
    }

    // 4. Resolve business website subdomain for contextual fallback
    const website = await prisma.website.findFirst({
      where: { organizationId: user.organizationId },
    });

    // 5. Validate Destination and Protocol
    const validDest = validateDestination(
      (destinationType as SmartLinkDestinationType) || 'WEBSITE',
      destinationValue || '',
      website?.subdomain
    );

    if (!validDest.isValid) {
      return NextResponse.json(
        { error: validDest.error || 'Invalid destination specified.' },
        { status: 400 }
      );
    }

    // 6. Verify Campaign ownership if campaignId passed
    let verifiedCampaignId: string | null = null;
    if (campaignId) {
      const camp = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          organizationId: user.organizationId,
        },
      });
      if (camp) {
        verifiedCampaignId = camp.id;
      }
    }

    // 7. Parse Expiration Date if specified
    let parsedExpiresAt: Date | null = null;
    if (expiresAt) {
      const exp = new Date(expiresAt);
      if (isNaN(exp.getTime())) {
        return NextResponse.json({ error: 'Invalid expiration date format.' }, { status: 400 });
      }
      parsedExpiresAt = exp;
    }

    // 8. Persist Smart Link in Neon Database
    const smartLink = await prisma.smartLink.create({
      data: {
        organizationId: user.organizationId,
        campaignId: verifiedCampaignId,
        slug: slugValidation.slug,
        name: name.trim().slice(0, 100),
        destinationType: validDest.destinationType,
        destinationValue: validDest.destinationUrl,
        isActive: Boolean(isActive),
        expiresAt: parsedExpiresAt,
        totalClicks: 0,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            channel: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      link: smartLink,
      message: 'Smart link created successfully.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/smart-links] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create smart link.' },
      { status: 500 }
    );
  }
}
