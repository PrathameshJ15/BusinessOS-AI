import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseStoredBlocks, serializeStoredBlocks } from '@/lib/website-storage';
import { WebsiteBlock } from '@businessos/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── PATCH /api/website/blocks/[id] — Update single block content ────────────

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;
    if (!id) {
      return NextResponse.json({ error: 'Block ID is required.' }, { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const site = await prisma.website.findFirst({
      where: { organizationId: user.organizationId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Website not found for organization.' }, { status: 404 });
    }

    const blocks: WebsiteBlock[] = parseStoredBlocks(site.fontFamily);
    const blockIndex = blocks.findIndex((b: WebsiteBlock) => b.id === id);

    if (blockIndex === -1) {
      return NextResponse.json({ error: 'Block not found in website.' }, { status: 404 });
    }

    const targetBlock = blocks[blockIndex];
    const updatedContent = {
      ...targetBlock.content,
      ...(body.content || {}),
      ...(body.heading ? { heading: body.heading } : {}),
      ...(body.subheading !== undefined ? { subheading: body.subheading } : {}),
    };

    blocks[blockIndex] = {
      ...targetBlock,
      title: body.title || targetBlock.title,
      subtitle: body.subtitle !== undefined ? body.subtitle : targetBlock.subtitle,
      content: updatedContent,
    };

    const cleanFont = (site.fontFamily || 'Inter').split(':::')[0] || 'Inter';
    const serialized = serializeStoredBlocks(cleanFont, blocks);

    await prisma.website.update({
      where: { id: site.id },
      data: { fontFamily: serialized },
    });

    return NextResponse.json({
      success: true,
      block: blocks[blockIndex],
    });
  } catch (error) {
    console.error('[PATCH /api/website/blocks/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update website block.' }, { status: 500 });
  }
}
