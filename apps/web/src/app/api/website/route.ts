import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockWebsite } from '@businessos/database';
import { Website, WebsiteBlock } from '@businessos/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Helpers for block encoding in database ───────────────────────────────────

import { parseStoredBlocks, serializeStoredBlocks } from '@/lib/website-storage';
export { parseStoredBlocks, serializeStoredBlocks };

// ─── GET /api/website — Retrieve organization website with blocks ─────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let site = await prisma.website.findFirst({
      where: { organizationId: user.organizationId },
    });

    if (!site && user.organizationId === 'org-lumina-101') {
      try {
        site = await prisma.website.create({
          data: {
            organizationId: user.organizationId,
            domainName: mockWebsite.domainName,
            subdomain: mockWebsite.subdomain,
            isPublished: mockWebsite.isPublished,
            themeColor: mockWebsite.themeColor,
            fontFamily: serializeStoredBlocks(mockWebsite.fontFamily, mockWebsite.pages[0].blocks),
          },
        });
      } catch (seedErr) {
        console.error('[GET /api/website] Seed fallback error:', seedErr);
      }
    }

    if (!site) {
      return NextResponse.json(mockWebsite);
    }

    const blocks = parseStoredBlocks(site.fontFamily);
    const cleanFont = site.fontFamily.split(':::')[0] || 'Inter';

    const fullWebsite: Website = {
      id: site.id,
      organizationId: site.organizationId,
      domainName: site.domainName,
      subdomain: site.subdomain,
      isPublished: site.isPublished,
      themeColor: site.themeColor,
      fontFamily: cleanFont,
      updatedAt: site.updatedAt.toISOString(),
      pages: [
        {
          id: `pg-${site.id}`,
          title: 'Home',
          slug: '/',
          isPublished: site.isPublished,
          metaDescription: `${site.domainName} - Powered by Saarthi AI`,
          blocks,
        },
      ],
    };

    return NextResponse.json(fullWebsite);
  } catch (error) {
    console.error('[GET /api/website] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve website data.' }, { status: 500 });
  }
}

// ─── PATCH /api/website — Update website blocks, publication & styles ─────────

export async function PATCH(request: NextRequest) {
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

    let existingSite = await prisma.website.findFirst({
      where: { organizationId: user.organizationId },
    });

    if (!existingSite) {
      existingSite = await prisma.website.create({
        data: {
          organizationId: user.organizationId,
          domainName: body.domainName || `${(user.organizationName || 'business').toLowerCase().replace(/[^a-z0-9]/g, '')}.businessos.app`,
          subdomain: body.subdomain || (user.organizationName || 'business').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          isPublished: body.isPublished !== undefined ? body.isPublished : true,
          themeColor: body.themeColor || '#0F172A',
          fontFamily: 'Inter',
        },
      });
    }

    const dataToUpdate: any = {};
    if (body.isPublished !== undefined) dataToUpdate.isPublished = Boolean(body.isPublished);
    if (body.themeColor) dataToUpdate.themeColor = body.themeColor;
    if (body.domainName) dataToUpdate.domainName = body.domainName;
    if (body.subdomain) dataToUpdate.subdomain = body.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Blocks update
    let currentBlocks = parseStoredBlocks(existingSite.fontFamily);
    const cleanFont = existingSite.fontFamily.split(':::')[0] || 'Inter';

    if (body.blocks && Array.isArray(body.blocks)) {
      currentBlocks = body.blocks;
      dataToUpdate.fontFamily = serializeStoredBlocks(cleanFont, currentBlocks);
    } else if (body.pages && Array.isArray(body.pages) && body.pages[0]?.blocks) {
      currentBlocks = body.pages[0].blocks;
      dataToUpdate.fontFamily = serializeStoredBlocks(cleanFont, currentBlocks);
    }

    const updated = await prisma.website.update({
      where: { id: existingSite.id },
      data: dataToUpdate,
    });

    const updatedBlocks = parseStoredBlocks(updated.fontFamily);
    const updatedFont = updated.fontFamily.split(':::')[0] || 'Inter';

    const fullWebsite: Website = {
      id: updated.id,
      organizationId: updated.organizationId,
      domainName: updated.domainName,
      subdomain: updated.subdomain,
      isPublished: updated.isPublished,
      themeColor: updated.themeColor,
      fontFamily: updatedFont,
      updatedAt: updated.updatedAt.toISOString(),
      pages: [
        {
          id: `pg-${updated.id}`,
          title: 'Home',
          slug: '/',
          isPublished: updated.isPublished,
          metaDescription: `${updated.domainName} - Powered by Saarthi AI`,
          blocks: updatedBlocks,
        },
      ],
    };

    return NextResponse.json(fullWebsite);
  } catch (error) {
    console.error('[PATCH /api/website] Error:', error);
    return NextResponse.json({ error: 'Failed to update website.' }, { status: 500 });
  }
}
