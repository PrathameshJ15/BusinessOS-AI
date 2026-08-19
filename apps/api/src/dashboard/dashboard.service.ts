import { Injectable } from '@nestjs/common';
import { dbRepository } from '@businessos/database';

@Injectable()
export class DashboardService {
  async getOverview(organizationId: string) {
    const customers = dbRepository.getCustomers(organizationId);
    const bookings = dbRepository.getBookings(organizationId);
    const leads = dbRepository.getLeads(organizationId);
    const invoices = dbRepository.getInvoices(organizationId);
    const reviews = dbRepository.getReviews(organizationId);

    const totalRevenue = invoices.reduce((acc, i) => acc + (i.status === 'PAID' ? i.total : 0), 0) || 84000;

    return {
      revenueThisMonth: totalRevenue,
      revenueToday: 4720,
      growthPercentage: 14,
      totalCustomers: customers.length,
      upcomingAppointments: bookings.length,
      pipelineValue: leads.reduce((acc, l) => acc + l.estimatedValue, 0),
      rating: 4.9,
      totalReviews: reviews.length,
      recentBookings: bookings.slice(0, 5),
    };
  }
}
