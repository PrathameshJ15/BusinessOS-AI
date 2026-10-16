import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateSmartSlug, validateDestination } from '@/lib/smart-links';
import { SmartLinkDestinationType } from '@businessos/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── PATCH /api/smart-links/[id] — Update an existing smart link ─────────────

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const linkId = resolvedParams?.id;
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required.' }, { status: 400 });
    }

    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    // Verify tenant ownership
    const existingLink = await prisma.smartLink.findFirst({
      where: {
        id: linkId,
        organizationId: user.organizationId,
      },
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: 'Smart link not found or access denied.' },
        { status: 404 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const updateData: any = {};

    // 1. Update Name
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'Link name cannot be empty.' }, { status: 400 });
      }
      updateData.name = body.name.trim().slice(0, 100);
    }

    // 2. Update Slug if changed
    if (body.slug !== undefined && body.slug !== existingLink.slug) {
      const slugVal = validateSmartSlug(body.slug);
      if (!slugVal.isValid) {
        return NextResponse.json(
          { error: slugVal.error || 'Invalid slug format.' },
          { status: 400 }
        );
      }

      // Check collision
      const slugCollision = await prisma.smartLink.findFirst({
        where: {
          slug: slugVal.slug,
          id: { not: linkId },
        },
      });
      if (slugCollision) {
        return NextResponse.json(
          { error: `The slug "${slugVal.slug}" is already in use.` },
          { status: 409 }
        );
      }
      updateData.slug = slugVal.slug;
    }

    // 3. Update Destination
    if (body.destinationValue !== undefined || body.destinationType !== undefined) {
      const targetType = (body.destinationType || existingLink.destinationType) as SmartLinkDestinationType;
      const targetValue = body.destinationValue !== undefined ? body.destinationValue : existingLink.destinationValue;

      const website = await prisma.website.findFirst({
        where: { organizationId: user.organizationId },
      });

      const destVal = validateDestination(targetType, targetValue, website?.subdomain);
      if (!destVal.isValid) {
        return NextResponse.json(
          { error: destVal.error || 'Invalid destination specified.' },
          { status: 400 }
        );
      }
      updateData.destinationType = destVal.destinationType;
      updateData.destinationValue = destVal.destinationUrl;
    }

    // 4. Update Status (isActive)
    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    // 5. Update Expiration
    if (body.expiresAt !== undefined) {
      if (body.expiresAt === null || body.expiresAt === '') {
        updateData.expiresAt = null;
      } else {
        const exp = new Date(body.expiresAt);
        if (isNaN(exp.getTime())) {
          return NextResponse.json({ error: 'Invalid expiration date format.' }, { status: 400 });
        }
        updateData.expiresAt = exp;
      }
    }

    // 6. Update Campaign association
    if (body.campaignId !== undefined) {
      if (body.campaignId === null || body.campaignId === '') {
        updateData.campaignId = null;
      } else {
        const camp = await prisma.campaign.findFirst({
          where: {
            id: body.campaignId,
            organizationId: user.organizationId,
          },
        });
        if (!camp) {
          return NextResponse.json({ error: 'Selected campaign not found.' }, { status: 404 });
        }
        updateData.campaignId = camp.id;
      }
    }

    const updated = await prisma.smartLink.update({
      where: { id: linkId },
      data: updateData,
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
      link: updated,
      message: 'Smart link updated successfully.',
    });
  } catch (error: any) {
    console.error('[PATCH /api/smart-links/[id]] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update smart link.' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/smart-links/[id] — Delete a smart link ───────────────────────

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const linkId = resolvedParams?.id;
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required.' }, { status: 400 });
    }

    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const existingLink = await prisma.smartLink.findFirst({
      where: {
        id: linkId,
        organizationId: user.organizationId,
      },
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: 'Smart link not found or access denied.' },
        { status: 404 }
      );
    }

    await prisma.smartLink.delete({
      where: { id: linkId },
    });

    return NextResponse.json({
      success: true,
      message: 'Smart link deleted successfully.',
    });
  } catch (error: any) {
    console.error('[DELETE /api/smart-links/[id]] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete smart link.' },
      { status: 500 }
    );
  }
}
