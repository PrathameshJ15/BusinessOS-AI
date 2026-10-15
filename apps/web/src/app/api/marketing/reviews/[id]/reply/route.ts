import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockReviews } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── POST /api/marketing/reviews/[id]/reply — Persist review response ────────

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const responseText = body.responseText?.trim();
    if (!responseText) {
      return NextResponse.json({ error: 'Response text is required.' }, { status: 400 });
    }

    // Tenant check: verify review belongs to organization
    let existingReview = await prisma.review.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    // If review is not in DB yet (e.g. from mockReviews in demo tenant), seed it first
    if (!existingReview) {
      const mock = mockReviews.find((r) => r.id === id);
      if (mock) {
        existingReview = await prisma.review.create({
          data: {
            id: mock.id,
            organizationId: user.organizationId,
            authorName: mock.authorName,
            authorAvatar: mock.authorAvatar || null,
            rating: mock.rating,
            platform: mock.platform,
            content: mock.content,
            sentiment: mock.sentiment,
            aiSuggestedResponse: mock.aiSuggestedResponse || null,
            responseText,
          },
        });
        return NextResponse.json(existingReview);
      } else {
        return NextResponse.json({ error: 'Review not found in this organization.' }, { status: 404 });
      }
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { responseText },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[POST /api/marketing/reviews/:id/reply] Error:', error);
    return NextResponse.json({ error: 'Failed to persist review reply.' }, { status: 500 });
  }
}
