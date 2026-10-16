import { prisma } from '../prisma';
import { ROLE_PERMISSIONS } from '@businessos/auth';

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

    if (link) {
      return { ...link.business, userRole: link.role };
    }

    // Fallback: Resolve via user's organization membership
    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: {
        organization: {
          include: { profile: true },
        },
      },
    });

    if (membership?.organization) {
      const org = membership.organization;
      return {
        id: `biz-${org.id}`,
        name: org.name,
        type: org.profile?.businessType || 'SALON',
        industry: org.profile?.businessType || 'Beauty & Wellness',
        description: org.profile?.description || org.profile?.tagline || `${org.name} - Excellence in Services`,
        email: org.profile?.email || 'contact@luminaluxe.com',
        phone: org.profile?.phone || '+91 98200 12345',
        website: org.profile?.websiteUrl || `https://${org.slug}.businessos.app`,
        address: org.profile?.address || 'Bandra West, Linking Road',
        city: org.profile?.city || 'Mumbai',
        state: org.profile?.state || 'Maharashtra',
        country: 'India',
        employeeCount: 12,
        businessStage: 'GROWTH',
        targetCustomers: 'Retail clients, appointments, premium members',
        productsServices: 'Salon styling, spa therapy, wellness rituals',
        logoUrl: org.logoUrl || null,
        taxId: '27AABCU9603R1ZM',
        userRole: membership.role.toLowerCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return null;
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
    const userRecord = await tx.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    // 4. Generate clean unique slug for the organization
    const baseSlug = input.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'workspace';
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    // 5. Create or find Organization and link to User via Membership
    const existingMembership = await tx.membership.findFirst({
      where: { userId },
      include: { organization: true },
    });

    let organizationId: string;

    if (existingMembership) {
      await tx.organization.update({
        where: { id: existingMembership.organizationId },
        data: { name: input.name.trim() },
      });
      organizationId = existingMembership.organizationId;
    } else {
      const org = await tx.organization.create({
        data: {
          name: input.name.trim(),
          slug,
          plan: 'PRO',
          status: 'ACTIVE',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          memberships: {
            create: {
              userId,
              role: 'OWNER',
              permissions: ROLE_PERMISSIONS['OWNER'],
            },
          },
        },
      });
      organizationId = org.id;
    }

    // 6. Create / Update BusinessProfile for the Organization
    await tx.businessProfile.upsert({
      where: { organizationId },
      create: {
        organizationId,
        businessType: input.type?.trim() || 'SALON',
        tagline: input.description?.trim() || `${input.name} - Excellence in Service`,
        description: input.description?.trim() || '',
        phone: input.phone?.trim() || '+91 90000 00000',
        email: input.email?.trim() || 'contact@example.com',
        address: input.address?.trim() || 'Commercial Area',
        city: input.city?.trim() || 'Mumbai',
        state: input.state?.trim() || 'Maharashtra',
        zipCode: '400001',
        websiteUrl: input.website?.trim() || null,
      },
      update: {
        businessType: input.type?.trim() || 'SALON',
        tagline: input.description?.trim() || `${input.name} - Excellence in Service`,
        description: input.description?.trim() || '',
        phone: input.phone?.trim() || '+91 90000 00000',
        email: input.email?.trim() || 'contact@example.com',
        address: input.address?.trim() || 'Commercial Area',
        city: input.city?.trim() || 'Mumbai',
        state: input.state?.trim() || 'Maharashtra',
        websiteUrl: input.website?.trim() || null,
      },
    });

    // 7. Ensure default Website exists for the Organization
    await tx.website.upsert({
      where: { organizationId },
      create: {
        organizationId,
        domainName: `${slug}.businessos.app`,
        subdomain: slug,
        isPublished: false,
        themeColor: '#0F172A',
        fontFamily: 'Inter',
      },
      update: {
        domainName: `${slug}.businessos.app`,
      },
    });

    // 8. Ensure default Service exists for bookings
    const serviceCount = await tx.service.count({ where: { organizationId } });
    if (serviceCount === 0) {
      await tx.service.create({
        data: {
          organizationId,
          name: input.productsServices?.split(',')[0]?.trim() || 'Consultation & Service',
          description: 'Standard client consultation and initial service session.',
          category: input.type || 'General',
          durationMinutes: 45,
          price: 999,
          isActive: true,
        },
      });
    }

    // 9. Ensure default Staff exists for appointments
    const staffCount = await tx.staff.count({ where: { organizationId } });
    if (staffCount === 0) {
      await tx.staff.create({
        data: {
          organizationId,
          name: userRecord?.name || 'Primary Specialist',
          role: 'Lead Specialist',
          email: userRecord?.email || 'staff@example.com',
          phone: input.phone?.trim() || '+91 90000 00000',
          isAvailable: true,
        },
      });
    }

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

  const updatedBiz = await prisma.business.update({
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

  // Synchronize with Organization & BusinessProfile if user has an active membership
  const userOrg = await prisma.membership.findFirst({
    where: { userId },
  });

  if (userOrg) {
    if (input.name) {
      await prisma.organization.update({
        where: { id: userOrg.organizationId },
        data: { name: input.name.trim() },
      });
    }

    await prisma.businessProfile.updateMany({
      where: { organizationId: userOrg.organizationId },
      data: {
        ...(input.type && { businessType: input.type.trim() }),
        ...(input.description !== undefined && { description: input.description.trim() }),
        ...(input.phone && { phone: input.phone.trim() }),
        ...(input.email && { email: input.email.trim() }),
        ...(input.address && { address: input.address.trim() }),
        ...(input.city && { city: input.city.trim() }),
        ...(input.state && { state: input.state.trim() }),
        ...(input.website && { websiteUrl: input.website.trim() }),
      },
    });
  }

  return updatedBiz;
}
