import { prisma } from '../prisma';

export interface BusinessOnboardingInput {
  name: string;
  type?: string;
  industry?: string;
  description?: string;

  email?: string;
  phone?: string;
  website?: string;

  address?: string;
  city?: string;
  state?: string;
  country?: string;

  employeeCount?: number;
  businessStage?: string;
  targetCustomers?: string;
  productsServices?: string;

  logoUrl?: string;
  taxId?: string;
}

export async function getBusinessForUser(userId: string) {
  try {
    const link = await prisma.businessUser.findFirst({
      where: { userId },
      include: { business: true },
    });

    return link ? { ...link.business, userRole: link.role } : null;
  } catch (error) {
    console.error('[getBusinessForUser] Error:', error);
    return null;
  }
}

export async function createBusinessForUser(userId: string, input: BusinessOnboardingInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create Business
    const business = await tx.business.create({
      data: {
        name: input.name.trim(),
        type: input.type?.trim() || 'GENERAL',
        industry: input.industry?.trim() || 'General Business',
        description: input.description?.trim() || null,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        website: input.website?.trim() || null,
        address: input.address?.trim() || null,
        city: input.city?.trim() || null,
        state: input.state?.trim() || null,
        country: input.country?.trim() || 'India',
        employeeCount: input.employeeCount ? Number(input.employeeCount) : 1,
        businessStage: input.businessStage?.trim() || 'GROWTH',
        targetCustomers: input.targetCustomers?.trim() || null,
        productsServices: input.productsServices?.trim() || null,
        logoUrl: input.logoUrl?.trim() || null,
        taxId: input.taxId?.trim() || null,
      },
    });

    // 2. Create BusinessUser Relationship (Role = owner)
    await tx.businessUser.create({
      data: {
        userId,
        businessId: business.id,
        role: 'owner',
      },
    });

    // 3. Set User onboardingCompleted = true
    await tx.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    return business;
  });
}

export async function updateBusiness(businessId: string, userId: string, input: Partial<BusinessOnboardingInput>) {
  // Verify ownership
  const membership = await prisma.businessUser.findUnique({
    where: { userId_businessId: { userId, businessId } },
  });

  if (!membership || membership.role !== 'owner') {
    throw new Error('Unauthorized: Only business owners can update business details.');
  }

  return await prisma.business.update({
    where: { id: businessId },
    data: {
      ...(input.name && { name: input.name.trim() }),
      ...(input.type && { type: input.type.trim() }),
      ...(input.industry && { industry: input.industry.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.email !== undefined && { email: input.email?.trim() || null }),
      ...(input.phone !== undefined && { phone: input.phone?.trim() || null }),
      ...(input.website !== undefined && { website: input.website?.trim() || null }),
      ...(input.address !== undefined && { address: input.address?.trim() || null }),
      ...(input.city !== undefined && { city: input.city?.trim() || null }),
      ...(input.state !== undefined && { state: input.state?.trim() || null }),
      ...(input.targetCustomers !== undefined && { targetCustomers: input.targetCustomers?.trim() || null }),
      ...(input.productsServices !== undefined && { productsServices: input.productsServices?.trim() || null }),
      ...(input.employeeCount !== undefined && { employeeCount: Number(input.employeeCount) }),
      ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl?.trim() || null }),
      ...(input.taxId !== undefined && { taxId: input.taxId?.trim() || null }),
    },
  });
}
