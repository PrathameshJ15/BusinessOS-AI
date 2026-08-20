import { prisma } from '../prisma';

export async function getCustomers(organizationId: string) {
  try {
    return await prisma.customer.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('[getCustomers] Error querying database:', error);
    return [];
  }
}

export async function createCustomer(organizationId: string, data: { name: string; email: string; phone: string; tags?: string[] }) {
  return await prisma.customer.create({
    data: {
      organizationId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      tags: data.tags || ['New Client'],
      status: 'ACTIVE',
      lifetimeValue: 0,
      totalBookings: 0,
    },
  });
}
