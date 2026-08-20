import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Saarthi Database Seed...');

  // 1. Seed Accounts required for testing (Requirement 24)
  const usersData = [
    {
      id: 'usr-prathamesh',
      email: 'prathamesh@test.com',
      name: 'Prathamesh',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98200 11223',
    },
    {
      id: 'usr-krushna',
      email: 'krushna@test.com',
      name: 'Krushna',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98200 44556',
    },
    {
      id: 'usr-admin',
      email: 'admin@test.com',
      name: 'Admin',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98200 77889',
    },
    {
      id: 'usr-ananya',
      email: 'ananya@luminaluxe.com',
      name: 'Ananya Verma',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, image: u.image, avatarUrl: u.avatarUrl, onboardingCompleted: true },
      create: { ...u, onboardingCompleted: true },
    });
  }

  // 2. Organization & Business
  const org = await prisma.organization.upsert({
    where: { slug: 'lumina-luxe' },
    update: {},
    create: {
      id: 'org-lumina-101',
      name: 'Lumina Luxe Spa & Salon',
      slug: 'lumina-luxe',
      plan: 'PRO',
      status: 'ACTIVE',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  });

  const biz = await prisma.business.upsert({
    where: { id: 'biz-lumina-101' },
    update: {},
    create: {
      id: 'biz-lumina-101',
      name: 'Lumina Luxe Spa & Salon',
      type: 'SALON',
      industry: 'Wellness & Spa Aesthetics',
      description: 'Luxury wellness spa and beauty salon serving premium skincare, massage, and hair styling services.',
      email: 'contact@luminaluxe.com',
      phone: '+91 98765 43210',
      website: 'https://luminaluxe.com',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      employeeCount: 12,
      businessStage: 'GROWTH',
      targetCustomers: 'Modern urban professionals, VIP wellness enthusiasts, couples',
      productsServices: 'Hydra-Facials, Keratin Hair Spa, Deep Tissue Massage, Bridal Makeover',
    },
  });

  // 3. Memberships & BusinessUsers
  for (const u of usersData) {
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    if (user) {
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
          role: u.email === 'krushna@test.com' ? 'MANAGER' : 'OWNER',
          permissions: ['org:read', 'org:write', 'ai:execute'],
        },
      });

      await prisma.businessUser.upsert({
        where: {
          userId_businessId: {
            userId: user.id,
            businessId: biz.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          businessId: biz.id,
          role: u.email === 'krushna@test.com' ? 'member' : 'owner',
        },
      });
    }
  }

  // 4. Initial AI Usage for users
  const prathamesh = await prisma.user.findUnique({ where: { email: 'prathamesh@test.com' } });
  if (prathamesh) {
    await prisma.aiUsage.upsert({
      where: { userId: prathamesh.id },
      update: {},
      create: {
        userId: prathamesh.id,
        dailyRequests: 5,
        monthlyRequests: 42,
        tokensUsed: 12500,
        lastRequestAt: new Date(),
      },
    });
  }

  // 5. Initial Customers
  const customerCount = await prisma.customer.count({ where: { organizationId: org.id } });
  if (customerCount === 0) {
    await prisma.customer.createMany({
      data: [
        {
          id: 'cust-101',
          organizationId: org.id,
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          phone: '+91 98112 34567',
          tags: ['VIP Client', 'Regular'],
          status: 'ACTIVE',
          lifetimeValue: 8400,
          totalBookings: 6,
        },
        {
          id: 'cust-102',
          organizationId: org.id,
          name: 'Sarah Miller',
          email: 'sarah.m@example.com',
          phone: '+91 98223 45678',
          tags: ['Spa Package'],
          status: 'ACTIVE',
          lifetimeValue: 12500,
          totalBookings: 4,
        },
        {
          id: 'cust-103',
          organizationId: org.id,
          name: 'Aishwarya Roy',
          email: 'aishwarya@example.com',
          phone: '+91 98334 56789',
          tags: ['Bridal Package'],
          status: 'ACTIVE',
          lifetimeValue: 15000,
          totalBookings: 2,
        },
      ],
    });
  }

  // 6. Initial Services
  const serviceCount = await prisma.service.count({ where: { organizationId: org.id } });
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          id: 'srv-201',
          organizationId: org.id,
          name: 'Signature Hydra-Facial & Glow Therapy',
          description: 'Deep cleansing, exfoliation, and hydration treatment.',
          category: 'Facial & Skincare',
          durationMinutes: 60,
          price: 2499,
          isActive: true,
        },
        {
          id: 'srv-202',
          organizationId: org.id,
          name: 'Keratin Hair Spa & Restructuring',
          description: 'Deep conditioning treatment for silky smooth hair.',
          category: 'Hair Care',
          durationMinutes: 90,
          price: 3499,
          isActive: true,
        },
      ],
    });
  }

  // 7. Initial Tasks
  const taskCount = await prisma.task.count({ where: { organizationId: org.id } });
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        {
          id: 'task-301',
          organizationId: org.id,
          title: 'Review weekend appointment bookings',
          description: 'Ensure staff allocations match customer preferences for Saturday.',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 86400000),
        },
        {
          id: 'task-302',
          organizationId: org.id,
          title: 'Launch WhatsApp promotional campaign',
          description: 'Dispatch 20% discount offer to inactive clients.',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 172800000),
        },
      ],
    });
  }

  console.log('✅ Saarthi Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
