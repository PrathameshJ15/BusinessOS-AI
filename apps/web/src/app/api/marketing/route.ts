import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const [campaigns, reviews] = await Promise.all([
      prisma.campaign.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ campaigns, reviews });
  } catch (error) {
    console.error('[GET /api/marketing] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const body = await request.json();
    if (!body.name || !body.content) {
      return NextResponse.json({ error: 'Campaign title and content are required.' }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: user.organizationId,
        name: body.name,
        channel: body.channel || 'WHATSAPP',
        status: 'COMPLETED',
        subject: body.subject || 'Special Offer',
        content: body.content,
        targetAudience: body.targetAudience || 'INACTIVE_30_DAYS',
        totalRecipients: 14,
        deliveredCount: 14,
        openedCount: 10,
        clickedCount: 6,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('[POST /api/marketing] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
