import { createAIService } from '@businessos/ai';
import { AuthSession, authorizeAction } from '@businessos/auth';
import { dbRepository } from '@businessos/database';

export class BusinessOSApiEngine {
  private aiService = createAIService('openai');

  // Middleware simulation for extracting tenant & session
  private getSession(reqRole: 'OWNER' | 'MANAGER' | 'STAFF' = 'OWNER'): AuthSession {
    return {
      userId: 'usr-1',
      userName: 'Ananya Verma',
      userEmail: 'ananya@luminaluxe.com',
      organizationId: 'org-lumina-101',
      organizationName: 'Lumina Luxe Spa & Salon',
      role: reqRole,
    };
  }

  public getDashboardOverview(role: 'OWNER' | 'MANAGER' | 'STAFF' = 'OWNER') {
    const session = this.getSession(role);
    const auth = authorizeAction(session, 'org:read');
    if (!auth.authorized) throw new Error(auth.reason);

    const customers = dbRepository.getCustomers(session.organizationId);
    const bookings = dbRepository.getBookings(session.organizationId);
    const leads = dbRepository.getLeads(session.organizationId);
    const reviews = dbRepository.getReviews(session.organizationId);
    const invoices = dbRepository.getInvoices(session.organizationId);

    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.status === 'PAID' ? inv.total : 0), 0);
    const activeCustomers = customers.filter((c) => c.status === 'ACTIVE' || c.status === 'VIP').length;
    const pendingBookings = bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED').length;

    return {
      organization: dbRepository.getOrganization(session.organizationId),
      stats: {
        totalRevenue,
        activeCustomers,
        pendingBookings,
        leadsCount: leads.length,
        averageRating: 4.9,
      },
      recentBookings: bookings.slice(0, 5),
      recentReviews: reviews.slice(0, 3),
      pendingLeads: leads.slice(0, 3),
    };
  }

  public async executeAICommand(prompt: string, role: 'OWNER' | 'MANAGER' | 'STAFF' = 'OWNER') {
    const session = this.getSession(role);
    return await this.aiService.processUserCommand(prompt, session);
  }
}

export const apiEngine = new BusinessOSApiEngine();
console.log('BusinessOS NestJS API Engine initialized.');
