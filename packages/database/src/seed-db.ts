import { PrismaClient } from '@prisma/client';
import {
  mockBookings,
  mockBusinessProfile,
  mockCampaigns,
  mockCustomers,
  mockIntegrations,
  mockInvoices,
  mockLeads,
  mockOrganization,
  mockReviews,
  mockServices,
  mockStaff,
  mockSubscription,
  mockTasks,
  mockUsers,
} from './seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Neon PostgreSQL Database Seed...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: mockOrganization.id },
    update: {},
    create: {
      id: mockOrganization.id,
      name: mockOrganization.name,
      slug: mockOrganization.slug,
      logoUrl: mockOrganization.logoUrl,
      plan: 'PRO',
      status: 'ACTIVE',
      currency: mockOrganization.currency || 'INR',
      timezone: mockOrganization.timezone || 'Asia/Kolkata',
    },
  });
  console.log(`✅ Created/Found Organization: ${org.name}`);

  // 2. Create Users & Memberships
  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    });

    const role = user.id === 'usr-1' ? 'OWNER' : user.id === 'usr-2' ? 'MANAGER' : 'STAFF';
    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        userId: user.id,
        role: role as any,
        permissions: ['*'],
      },
    });
  }
  console.log(`✅ Created Users & Memberships`);

  // 3. Create Business Profile
  await prisma.businessProfile.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      businessType: mockBusinessProfile.businessType,
      tagline: mockBusinessProfile.tagline,
      description: mockBusinessProfile.description,
      phone: mockBusinessProfile.phone,
      email: mockBusinessProfile.email,
      address: mockBusinessProfile.address,
      city: mockBusinessProfile.city,
      state: mockBusinessProfile.state,
      zipCode: mockBusinessProfile.zipCode,
      websiteUrl: mockBusinessProfile.websiteUrl,
      googleRating: mockBusinessProfile.googleRating,
      totalReviews: mockBusinessProfile.totalReviews,
    },
  });
  console.log(`✅ Created Business Profile`);

  // 4. Create Customers
  for (const cust of mockCustomers) {
    await prisma.customer.upsert({
      where: { id: cust.id },
      update: {},
      create: {
        id: cust.id,
        organizationId: org.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        tags: cust.tags || [],
        status: cust.status || 'ACTIVE',
        lifetimeValue: cust.lifetimeValue || 0,
        totalBookings: cust.totalBookings || 0,
      },
    });
  }
  console.log(`✅ Created ${mockCustomers.length} Customers`);

  // 5. Create Services & Staff
  for (const srv of mockServices) {
    await prisma.service.upsert({
      where: { id: srv.id },
      update: {},
      create: {
        id: srv.id,
        organizationId: org.id,
        name: srv.name,
        description: srv.description,
        category: srv.category,
        durationMinutes: srv.durationMinutes,
        price: srv.price,
        isActive: srv.isActive !== false,
      },
    });
  }

  for (const stf of mockStaff) {
    await prisma.staff.upsert({
      where: { id: stf.id },
      update: {},
      create: {
        id: stf.id,
        organizationId: org.id,
        name: stf.name,
        role: stf.role,
        email: stf.email,
        phone: stf.phone,
        avatarUrl: stf.avatarUrl,
        isAvailable: stf.isAvailable !== false,
      },
    });
  }
  console.log(`✅ Created Services & Staff`);

  // 6. Create Bookings
  for (const bk of mockBookings) {
    await prisma.booking.upsert({
      where: { id: bk.id },
      update: {},
      create: {
        id: bk.id,
        organizationId: org.id,
        customerId: bk.customerId || 'cust-101',
        customerName: bk.customerName,
        customerPhone: bk.customerPhone || '+91 98112 34567',
        serviceId: bk.serviceId || 'srv-1',
        serviceName: bk.serviceName,
        staffId: bk.staffId || 'stf-1',
        staffName: bk.staffName,
        startTime: new Date(bk.startTime),
        endTime: new Date(bk.endTime),
        status: bk.status || 'CONFIRMED',
        paymentStatus: bk.paymentStatus || 'PAID',
        totalAmount: bk.totalAmount,
        notes: bk.notes,
      },
    });
  }
  console.log(`✅ Created ${mockBookings.length} Bookings`);

  // 7. Create Campaigns & Reviews
  for (const cmp of mockCampaigns) {
    await prisma.campaign.upsert({
      where: { id: cmp.id },
      update: {},
      create: {
        id: cmp.id,
        organizationId: org.id,
        name: cmp.name,
        channel: cmp.channel,
        status: cmp.status,
        subject: cmp.subject,
        content: cmp.content,
        targetAudience: cmp.targetAudience,
        totalRecipients: cmp.totalRecipients,
        deliveredCount: cmp.deliveredCount,
        openedCount: cmp.openedCount,
        clickedCount: cmp.clickedCount,
      },
    });
  }

  for (const rev of mockReviews) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: {},
      create: {
        id: rev.id,
        organizationId: org.id,
        authorName: rev.authorName,
        authorAvatar: rev.authorAvatar,
        rating: rev.rating,
        platform: rev.platform,
        content: rev.content,
        sentiment: rev.sentiment || 'POSITIVE',
        aiSuggestedResponse: rev.aiSuggestedResponse,
        responseText: rev.responseText,
      },
    });
  }
  console.log(`✅ Created Campaigns & Reviews`);

  // 8. Create Website, Invoices, Tasks
  await prisma.website.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      domainName: 'luminaluxe.businessos.app',
      subdomain: 'lumina-luxe',
      isPublished: true,
      themeColor: '#0F172A',
      fontFamily: 'Inter',
    },
  });

  for (const inv of mockInvoices) {
    await prisma.invoice.upsert({
      where: { id: inv.id },
      update: {},
      create: {
        id: inv.id,
        organizationId: org.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        customerEmail: inv.customerEmail,
        amount: inv.amount,
        tax: inv.tax,
        total: inv.total,
        currency: inv.currency || 'INR',
        status: inv.status,
        dueDate: new Date(inv.dueDate),
      },
    });
  }

  for (const tsk of mockTasks) {
    await prisma.task.upsert({
      where: { id: tsk.id },
      update: {},
      create: {
        id: tsk.id,
        organizationId: org.id,
        title: tsk.title,
        description: tsk.description,
        status: tsk.status,
        dueDate: new Date(tsk.dueDate),
        priority: tsk.priority,
      },
    });
  }
  console.log(`✅ Created Website, Invoices & Tasks`);

  console.log('🎉 Neon Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
