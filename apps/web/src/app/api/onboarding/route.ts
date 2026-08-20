import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createBusinessForUser, getBusinessForUser } from '@/lib/data/business';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/onboarding — Check onboarding status ──────────────────────────

export async function GET(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingCompleted: true },
    });

    const business = await getBusinessForUser(user.id);

    return NextResponse.json({
      onboardingCompleted: dbUser?.onboardingCompleted ?? false,
      business,
    });
  } catch (error) {
    console.error('[GET /api/onboarding] Error:', error);
    return NextResponse.json({ error: 'Failed to check onboarding status.' }, { status: 500 });
  }
}

// ─── POST /api/onboarding — Create Business & complete onboarding ────────────

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

    // 1. Validation
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Business Name is required.' }, { status: 400 });
    }

    if (body.email && (typeof body.email !== 'string' || !body.email.includes('@'))) {
      return NextResponse.json({ error: 'Please enter a valid business email address.' }, { status: 400 });
    }

    if (body.employeeCount && isNaN(Number(body.employeeCount))) {
      return NextResponse.json({ error: 'Employee count must be a valid number.' }, { status: 400 });
    }

    // 2. Create Business & User Relationship in Transaction
    const business = await createBusinessForUser(user.id, {
      name: body.name,
      type: body.type,
      industry: body.industry,
      description: body.description,
      email: body.email,
      phone: body.phone,
      website: body.website,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      employeeCount: body.employeeCount,
      businessStage: body.businessStage,
      targetCustomers: body.targetCustomers,
      productsServices: body.productsServices,
      logoUrl: body.logoUrl,
      taxId: body.taxId,
    });

    return NextResponse.json({
      success: true,
      onboardingCompleted: true,
      business,
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/onboarding] Error:', error);
    return NextResponse.json({ error: 'Failed to save business onboarding details.' }, { status: 500 });
  }
}
