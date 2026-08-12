import {
  mockBookings,
  mockBusinessProfile,
  mockCampaigns,
  mockCustomers,
  mockIntegrations,
  mockInvoices,
  mockLeads,
  mockMemberships,
  mockNotifications,
  mockOrganization,
  mockReviews,
  mockServices,
  mockStaff,
  mockSubscription,
  mockTasks,
  mockUsers,
  mockWebsite,
} from './seed';

export * from './seed';

export class BusinessOSRepository {
  private organization = { ...mockOrganization };
  private profile = { ...mockBusinessProfile };
  private customers = [...mockCustomers];
  private leads = [...mockLeads];
  private services = [...mockServices];
  private staff = [...mockStaff];
  private bookings = [...mockBookings];
  private campaigns = [...mockCampaigns];
  private reviews = [...mockReviews];
  private website = { ...mockWebsite };
  private invoices = [...mockInvoices];
  private tasks = [...mockTasks];
  private notifications = [...mockNotifications];
  private integrations = [...mockIntegrations];
  private subscription = { ...mockSubscription };

  // Tenant Isolated Query Helpers
  getOrganization(orgId: string) {
    if (this.organization.id !== orgId) return null;
    return this.organization;
  }

  getProfile(orgId: string) {
    if (this.profile.organizationId !== orgId) return null;
    return this.profile;
  }

  getCustomers(orgId: string) {
    return this.customers.filter((c) => c.organizationId === orgId);
  }

  getLeads(orgId: string) {
    return this.leads.filter((l) => l.organizationId === orgId);
  }

  getServices(orgId: string) {
    return this.services.filter((s) => s.organizationId === orgId);
  }

  getStaff(orgId: string) {
    return this.staff.filter((s) => s.organizationId === orgId);
  }

  getBookings(orgId: string) {
    return this.bookings.filter((b) => b.organizationId === orgId);
  }

  getCampaigns(orgId: string) {
    return this.campaigns.filter((c) => c.organizationId === orgId);
  }

  getReviews(orgId: string) {
    return this.reviews.filter((r) => r.organizationId === orgId);
  }

  getWebsite(orgId: string) {
    if (this.website.organizationId !== orgId) return null;
    return this.website;
  }

  getInvoices(orgId: string) {
    return this.invoices.filter((i) => i.organizationId === orgId);
  }

  getTasks(orgId: string) {
    return this.tasks.filter((t) => t.organizationId === orgId);
  }

  getNotifications(orgId: string) {
    return this.notifications.filter((n) => n.organizationId === orgId);
  }

  getIntegrations(orgId: string) {
    return this.integrations.filter((i) => i.organizationId === orgId);
  }

  getSubscription(orgId: string) {
    if (this.subscription.organizationId !== orgId) return null;
    return this.subscription;
  }

  // Operations / Mutations
  addCustomer(customer: any) {
    this.customers.unshift(customer);
    return customer;
  }

  addBooking(booking: any) {
    this.bookings.unshift(booking);
    return booking;
  }

  addCampaign(campaign: any) {
    this.campaigns.unshift(campaign);
    return campaign;
  }

  addInvoice(invoice: any) {
    this.invoices.unshift(invoice);
    return invoice;
  }

  updateWebsite(updatedWebsite: any) {
    this.website = { ...this.website, ...updatedWebsite };
    return this.website;
  }

  updateReviewResponse(reviewId: string, responseText: string) {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.responseText = responseText;
      rev.respondedAt = new Date().toISOString();
    }
    return rev;
  }
}

export const dbRepository = new BusinessOSRepository();
