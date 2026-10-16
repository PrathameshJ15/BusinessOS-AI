const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockUsers = [
  {
    id: 'usr-owner-1',
    name: 'Prathamesh Jadhav',
    email: 'owner@businessos.com',
    phone: '+91 98200 12345',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'OWNER',
  },
  {
    id: 'usr-manager-2',
    name: 'Krushna Sharma',
    email: 'manager@businessos.com',
    phone: '+91 98200 23456',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'MANAGER',
  },
  {
    id: 'usr-staff-3',
    name: 'Priya Patel',
    email: 'staff@businessos.com',
    phone: '+91 98200 34567',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'STAFF',
  },
  {
    id: 'usr-admin-4',
    name: 'Aditi Rao',
    email: 'admin@businessos.com',
    phone: '+91 98200 45678',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'OWNER',
  },
  {
    id: 'usr-prathamesh',
    name: 'Prathamesh Jadhav',
    email: 'prathamesh@test.com',
    phone: '+91 98200 12345',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'OWNER',
  },
  {
    id: 'usr-krushna',
    name: 'Krushna',
    email: 'krushna@test.com',
    phone: '+91 98200 23456',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'MANAGER',
  },
];

async function seed() {
  console.log('Seeding mock credential users into Neon DB...');
  const orgId = 'org-lumina-101';

  // Ensure organization exists
  const org = await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: {
      id: orgId,
      name: 'Lumina Luxe Spa & Salon',
      slug: 'lumina-luxe',
      plan: 'PRO',
      status: 'ACTIVE',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  });
  console.log('Verified organization:', org.name);

  for (const u of mockUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        avatarUrl: u.avatarUrl,
        image: u.avatarUrl,
        phone: u.phone,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        image: u.avatarUrl,
        phone: u.phone,
        onboardingCompleted: true,
      },
    });

    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id,
        },
      },
      update: {
        role: u.role,
      },
      create: {
        organizationId: orgId,
        userId: user.id,
        role: u.role,
        permissions: ['*'],
      },
    });

    console.log(`✅ Seeded user: ${u.email} (${u.role})`);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
