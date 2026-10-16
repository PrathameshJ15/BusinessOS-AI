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
  mockWhatsAppSettings,
  mockSmartLinks,
  mockSmartLinkEvents,
} from './seed';

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export * from '@prisma/client';
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
  private whatsappSettings = { ...mockWhatsAppSettings };
  private smartLinks = [...mockSmartLinks];
  private smartLinkEvents = [...mockSmartLinkEvents];

  // Tenant Isolated Query Helpers
  getWhatsAppSettings(orgId: string) {
    if (this.whatsappSettings.organizationId !== orgId) return null;
    return this.whatsappSettings;
  }

  updateWhatsAppSettings(orgId: string, settings: any) {
    this.whatsappSettings = {
      ...this.whatsappSettings,
      ...settings,
      organizationId: orgId,
      updatedAt: new Date().toISOString(),
    };
    return this.whatsappSettings;
  }

  getSmartLinks(orgId: string) {
    return this.smartLinks.filter((l) => l.organizationId === orgId);
  }

  getSmartLinkBySlug(slug: string) {
    return this.smartLinks.find((l) => l.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  addSmartLink(link: any) {
    this.smartLinks.unshift(link);
    return link;
  }

  recordSmartLinkEvent(event: any) {
    this.smartLinkEvents.unshift(event);
    const link = this.smartLinks.find((l) => l.id === event.smartLinkId);
    if (link) {
      link.totalClicks += 1;
    }
    return event;
  }

  getSmartLinkEvents(orgId: string) {
    return this.smartLinkEvents.filter((e) => e.organizationId === orgId);
  }

  getOrganization(orgId: string) {
    if (this.organization.id !== orgId) return null;
    return this.organization;
  }

  getProfile(orgId: string) {
    if (this.profile.organizationId !== orgId) return null;
    return this.profile;
  }

  getBusinessProfile(orgId: string) {
    return this.getProfile(orgId);
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
  addCustomer(orgId: string | any, data?: any) {
    const customer = typeof orgId === 'string' ? { ...data, id: `cust-${Date.now()}`, organizationId: orgId } : orgId;
    this.customers.unshift(customer);
    return customer;
  }

  updateLeadStage(orgId: string, leadId: string, stage: string) {
    const lead = this.leads.find((l) => l.id === leadId);
    if (lead) {
      lead.stage = stage as any;
    }
    return lead;
  }

  addBooking(orgId: string | any, data?: any) {
    const booking = typeof orgId === 'string' ? { ...data, id: `bk-${Date.now()}`, organizationId: orgId } : orgId;
    this.bookings.unshift(booking);
    return booking;
  }

  addCampaign(orgId: string | any, data?: any) {
    const campaign = typeof orgId === 'string' ? { ...data, id: `cmp-${Date.now()}`, organizationId: orgId } : orgId;
    this.campaigns.unshift(campaign);
    return campaign;
  }

  replyToReview(orgId: string, reviewId: string, responseText: string) {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.responseText = responseText;
    }
    return rev;
  }

  addInvoice(invoice: any) {
    this.invoices.unshift(invoice);
    return invoice;
  }

  updateWebsite(updatedWebsite: any) {
    this.website = { ...this.website, ...updatedWebsite };
    return this.website;
  }

  updateWebsiteBlock(orgId: string, blockId: string, content: any) {
    const updatedPages = this.website.pages.map((pg) => ({
      ...pg,
      blocks: pg.blocks.map((blk) => (blk.id === blockId ? { ...blk, content: { ...blk.content, ...content } } : blk)),
    }));
    this.website = { ...this.website, pages: updatedPages, updatedAt: new Date().toISOString() };
    return this.website;
  }

  publishWebsiteToggle(orgId: string) {
    this.website = { ...this.website, isPublished: !this.website.isPublished, updatedAt: new Date().toISOString() };
    return this.website;
  }

  updateReviewResponse(reviewId: string, responseText: string) {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.responseText = responseText;
    }
    return rev;
  }
}

export const dbRepository = new BusinessOSRepository();
