import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateWhatsAppPhone } from '@/lib/whatsapp';
import { mockWhatsAppSettings } from '@businessos/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/whatsapp/settings — Retrieve Tenant WhatsApp Settings ──────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let settings = await prisma.whatsAppSettings.findUnique({
      where: { organizationId: user.organizationId },
    });

    if (!settings) {
      // Look up business profile phone if available
      const org = await prisma.organization.findUnique({
        where: { id: user.organizationId },
        include: { profile: true },
      });

      const fallbackPhone = org?.profile?.phone ? validateWhatsAppPhone(org.profile.phone).normalized : '919876543210';

      settings = {
        id: `wa-set-${user.organizationId}`,
        organizationId: user.organizationId,
        phoneNumber: fallbackPhone,
        isEnabled: true,
        defaultWelcomeMessage: `Hello! I am contacting you from ${org?.name || 'your business'}.`,
        defaultCtaLabel: 'Chat on WhatsApp',
        visitorMessage: `Hi! I visited your website and would like to know more about your services.`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[GET /api/whatsapp/settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve WhatsApp settings.' },
      { status: 500 }
    );
  }
}

// ─── POST /api/whatsapp/settings — Save / Update WhatsApp Settings ───────────

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
      phoneNumber,
      isEnabled = true,
      defaultWelcomeMessage,
      defaultCtaLabel,
      visitorMessage,
    } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'WhatsApp phone number is required.' }, { status: 400 });
    }

    // Validate phone number server-side
    const phoneValidation = validateWhatsAppPhone(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error || 'Invalid WhatsApp phone number.' },
        { status: 400 }
      );
    }

    const sanitizedWelcome = (defaultWelcomeMessage || 'Hello! How can we assist you today?').trim().slice(0, 500);
    const sanitizedCtaLabel = (defaultCtaLabel || 'Chat on WhatsApp').trim().slice(0, 60);
    const sanitizedVisitorMsg = (visitorMessage || 'Hi! I visited your website and would like to know more about your services.').trim().slice(0, 500);

    const settings = await prisma.whatsAppSettings.upsert({
      where: { organizationId: user.organizationId },
      create: {
        organizationId: user.organizationId,
        phoneNumber: phoneValidation.normalized,
        isEnabled: Boolean(isEnabled),
        defaultWelcomeMessage: sanitizedWelcome,
        defaultCtaLabel: sanitizedCtaLabel,
        visitorMessage: sanitizedVisitorMsg,
      },
      update: {
        phoneNumber: phoneValidation.normalized,
        isEnabled: Boolean(isEnabled),
        defaultWelcomeMessage: sanitizedWelcome,
        defaultCtaLabel: sanitizedCtaLabel,
        visitorMessage: sanitizedVisitorMsg,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
      message: 'WhatsApp configuration successfully saved to Neon database.',
    });
  } catch (error: any) {
    console.error('[POST /api/whatsapp/settings] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update WhatsApp settings.' },
      { status: 500 }
    );
  }
}
