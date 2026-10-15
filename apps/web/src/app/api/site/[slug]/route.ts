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
      return NextResponse.json({ error: 'Website not found or is currently private.' }, { status: 404 });
    }

    // 2. Fetch business name and offerings for this organization
    const org = await prisma.organization.findUnique({
      where: { id: site.organizationId },
      include: {
        services: {
          where: { isActive: true },
          take: 6,
        },
      },
    });

    const parsedBlocks = parseStoredBlocks(site.fontFamily);
    const businessName = org?.name || 'Lumina Luxe Salon & Wellness';

    const cleanFont = (site.fontFamily || 'Inter').split(':::')[0] || 'Inter';

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
