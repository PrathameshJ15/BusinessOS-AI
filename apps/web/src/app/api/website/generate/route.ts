import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeStoredBlocks } from '@/lib/website-storage';
import { WebsiteBlock } from '@businessos/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── POST /api/website/generate — AI Website Generation Wizard ───────────────

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

    const businessName = body.name?.trim() || user.organizationName || 'Lumina Luxe';
    const industry = body.industry?.trim() || 'Salon & Spa';
    const services = body.services?.trim() || 'Hair Styling, Hydra-Facial, Aromatherapy';
    const theme = body.theme?.trim() || 'Modern Luxury';

    // 1. Try Groq AI for intelligent customized blocks copy
    let heroHeading = `Experience Pure Elegance & Rejuvenation at ${businessName}`;
    let heroSubheading = `Premier ${industry} offering bespoke treatments, clinical expertise, and world-class care.`;
    let serviceItems = [
      { name: 'Hydra-Facial & Glow', price: '₹3,500', time: '60 Mins', icon: 'Sparkles' },
      { name: 'Aromatherapy Massage', price: '₹4,500', time: '90 Mins', icon: 'Heart' },
      { name: 'Precision Styling', price: '₹1,200', time: '45 Mins', icon: 'Scissors' },
    ];

    // If user specified custom services, parse them
    if (services) {
      const parsedServs = services.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (parsedServs.length > 0) {
        serviceItems = parsedServs.map((name: string, i: number) => ({
          name,
          price: `₹${(i + 1) * 999}`,
          time: '60 Mins',
          icon: i === 0 ? 'Sparkles' : i === 1 ? 'Heart' : 'Scissors',
        }));
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey !== 'your_groq_api_key' && !apiKey.startsWith('gsk_simulated')) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
            messages: [
              {
                role: 'system',
                content: 'You are an elite website copywriter. Generate catchy website copy in JSON format with keys "heroHeading" and "heroSubheading". Keep it concise and luxury.',
              },
              {
                role: 'user',
                content: `Business: "${businessName}", Industry: "${industry}", Offerings: "${services}", Theme: "${theme}". Output ONLY valid JSON.`,
              },
            ],
            temperature: 0.6,
            max_tokens: 250,
          }),
        });

        if (groqRes.ok) {
          const aiJson = await groqRes.json();
          const contentStr = aiJson.choices?.[0]?.message?.content?.trim();
          if (contentStr) {
            try {
              const cleaned = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.heroHeading) heroHeading = parsed.heroHeading;
              if (parsed.heroSubheading) heroSubheading = parsed.heroSubheading;
            } catch {}
          }
        }
      } catch (e) {
        console.warn('[Website Generate AI] Groq fallback:', e);
      }
    }

    const generatedBlocks: WebsiteBlock[] = [
      {
        id: 'blk-hero',
        type: 'HERO',
        title: heroHeading,
        subtitle: heroSubheading,
        content: {
          heading: heroHeading,
          subheading: heroSubheading,
          ctaText: 'Schedule Visit',
          ctaLink: '#booking-section',
          secondaryCtaText: 'Explore Offerings',
          bgImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80',
        },
        order: 1,
      },
      {
        id: 'blk-services',
        type: 'SERVICES',
        title: 'Signature Offerings & Packages',
        subtitle: `Curated exclusively for our ${businessName} patrons.`,
        content: {
          heading: 'Signature Offerings & Packages',
          subheading: `Curated exclusively for our ${businessName} patrons.`,
          items: serviceItems,
        },
        order: 2,
      },
      {
        id: 'blk-testimonials',
        type: 'TESTIMONIALS',
        title: 'Client Experiences & Accolades',
        subtitle: 'Read genuine verified reviews from delighted guests.',
        content: {
          heading: 'Client Experiences & Accolades',
          subheading: 'Read genuine verified reviews from delighted guests.',
          reviews: [
            { author: 'Meera K.', text: `The attention to detail at ${businessName} is unparalleled. Outstanding service!`, rating: 5 },
            { author: 'Arjun N.', text: 'Seamless appointment, exceptional staff, and noticeable results from day one.', rating: 5 },
          ],
        },
        order: 3,
      },
      {
        id: 'blk-contact',
        type: 'CONTACT',
        title: 'Reserve Your Appointment',
        subtitle: 'Connect with our specialists or schedule your session online.',
        content: {
          heading: 'Reserve Your Appointment',
          subheading: 'Connect with our specialists or schedule your session online.',
          formTitle: 'Inquire or Book Slot',
          buttonText: 'Submit Inquiry',
        },
        order: 4,
      },
    ];

    // Persist to Neon DB
    let site = await prisma.website.findFirst({
      where: { organizationId: user.organizationId },
    });

    const subdomain = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const domainName = `${subdomain}.businessos.app`;
    const serialized = serializeStoredBlocks('Inter', generatedBlocks);

    if (site) {
      site = await prisma.website.update({
        where: { id: site.id },
        data: {
          domainName,
          subdomain,
          isPublished: true,
          fontFamily: serialized,
        },
      });
    } else {
      site = await prisma.website.create({
        data: {
          organizationId: user.organizationId,
          domainName,
          subdomain,
          isPublished: true,
          themeColor: '#0F172A',
          fontFamily: serialized,
        },
      });
    }

    return NextResponse.json({
      success: true,
      website: {
        id: site.id,
        organizationId: site.organizationId,
        domainName: site.domainName,
        subdomain: site.subdomain,
        isPublished: site.isPublished,
        themeColor: site.themeColor,
        fontFamily: 'Inter',
        pages: [
          {
            id: `pg-${site.id}`,
            title: 'Home',
            slug: '/',
            isPublished: true,
            metaDescription: `${businessName} - Powered by Saarthi AI`,
            blocks: generatedBlocks,
          },
        ],
      },
    });
  } catch (error) {
    console.error('[POST /api/website/generate] Error:', error);
    return NextResponse.json({ error: 'Failed to generate website with AI.' }, { status: 500 });
  }
}
