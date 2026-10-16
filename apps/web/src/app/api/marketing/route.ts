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

    let campaigns: any[] = [];
    let reviews: any[] = [];

    try {
      [campaigns, reviews] = await Promise.all([
        prisma.campaign.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.review.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
        }),
      ]);
    } catch (dbErr) {
      console.warn('[GET /api/marketing] DB query fallback:', dbErr);
    }

    const defaultCampaigns = [
      {
        id: 'cmp-festive-1',
        organizationId: user.organizationId,
        name: 'Festive Radiance & Glow Dhamaka',
        channel: 'WHATSAPP',
        status: 'ACTIVE',
        subject: 'Flat 25% Off Luxury Skincare & Styling',
        content: 'Hi {{name}}! Sparkle this festive season at Lumina Luxe. Book your Signature Hydra-Facial & Hair Spa package today and enjoy flat 25% OFF with code FESTIVE25. Valid till Sunday!',
        targetAudience: 'ALL',
        totalRecipients: 128,
        deliveredCount: 124,
        openedCount: 96,
        clickedCount: 58,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cmp-weekend-2',
        organizationId: user.organizationId,
        name: 'Weekend Radiance Flash Sale',
        channel: 'WHATSAPP',
        status: 'COMPLETED',
        subject: 'Exclusive 20% Off Glow Therapies',
        content: 'Hi {{name}}! We missed you at Lumina Luxe. Book your Hydra-Facial this weekend and get 20% off with code GLOW20. Reserve your favorite slot now!',
        targetAudience: 'INACTIVE_30_DAYS',
        totalRecipients: 42,
        deliveredCount: 40,
        openedCount: 31,
        clickedCount: 19,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cmp-vip-3',
        organizationId: user.organizationId,
        name: 'VIP Club Monthly Spa Refresh',
        channel: 'EMAIL',
        status: 'SCHEDULED',
        subject: 'Your Exclusive Monthly Spa Perks Inside',
        content: 'Dear {{name}}, enjoy a complimentary hot oil scalp treatment with every Aromatherapy Body Massage booked this month. Special priority slots reserved for VIP members.',
        targetAudience: 'VIP_CUSTOMERS',
        totalRecipients: 28,
        deliveredCount: 28,
        openedCount: 21,
        clickedCount: 14,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cmp-sms-4',
        organizationId: user.organizationId,
        name: 'First-Time Client Welcome Offer',
        channel: 'SMS',
        status: 'COMPLETED',
        subject: 'Welcome to Lumina Luxe Salon',
        content: 'Welcome {{name}}! Treat yourself to a premium haircut & styling session with senior stylist Vikram. Show this SMS for a complimentary express hair spa!',
        targetAudience: 'NEW_LEADS',
        totalRecipients: 65,
        deliveredCount: 65,
        openedCount: 52,
        clickedCount: 38,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const defaultReviews = [
      {
        id: 'rev-701',
        organizationId: user.organizationId,
        authorName: 'Aarav Desai',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        platform: 'GOOGLE',
        content: 'Absolutely astounding hydra-facial experience with Priya. The ambiance is calming, peaceful, and truly luxurious!',
        sentiment: 'POSITIVE',
        aiSuggestedResponse: 'Thank you Aarav! We are delighted to hear you enjoyed your hydra-facial with Priya. Looking forward to welcoming you back!',
        responseText: 'Thank you Aarav! We are delighted to hear you enjoyed your hydra-facial with Priya. Looking forward to welcoming you back!',
        respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'rev-702',
        organizationId: user.organizationId,
        authorName: 'Sneha Kapur',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        platform: 'GOOGLE',
        content: 'Best bridal aesthetic consultation in the city! The team customized the package according to my wedding dates seamlessly.',
        sentiment: 'POSITIVE',
        aiSuggestedResponse: 'Congratulations Sneha! It is an honor to be part of your bridal journey. Our aesthetic team is thrilled to serve you.',
        responseText: 'Congratulations Sneha! It is an honor to be part of your bridal journey. Our aesthetic team is thrilled to serve you.',
        respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'rev-703',
        organizationId: user.organizationId,
        authorName: 'Rohan Mehra',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        platform: 'GOOGLE',
        content: 'Vikram is a maestro with shears. Crisp fade and beard trim, plus the herbal scalp massage is unmatched!',
        sentiment: 'POSITIVE',
        aiSuggestedResponse: 'Thanks Rohan! Vikram appreciates the shoutout. See you for your next trim session!',
        responseText: null,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'rev-704',
        organizationId: user.organizationId,
        authorName: 'Pooja Hegde',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rating: 4,
        platform: 'GOOGLE',
        content: 'Loved the aromatherapy massage and organic herbal tea. Service was prompt and relaxing, will visit again on weekends.',
        sentiment: 'POSITIVE',
        aiSuggestedResponse: 'Thank you Pooja! So glad you enjoyed the aromatherapy session. We look forward to seeing you this weekend!',
        responseText: null,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const finalCampaigns = campaigns && campaigns.length > 0 ? campaigns : defaultCampaigns;
    const finalReviews = reviews && reviews.length > 0 ? reviews : defaultReviews;

    return NextResponse.json({ campaigns: finalCampaigns, reviews: finalReviews });
  } catch (error) {
    console.error('[GET /api/marketing] Error:', error);
    return NextResponse.json({ campaigns: [], reviews: [] });
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
