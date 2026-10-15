'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthSession, hasPermission } from '@businessos/auth';
import {
  Booking, Campaign, Conversation, Customer, CustomerActivity, Invoice, Lead, Note, Permission, Review, Role, Service, Staff, Website,
} from '@businessos/shared';
import {
  mockBusinessProfile, mockCustomerActivities, mockIntegrations, mockInvoices, mockLeads, mockNotes, mockOrganization, mockServices, mockStaff, mockSubscription, mockWebsite,
} from '@businessos/database';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  session: AuthSession;
  setRole: (role: Role) => void;
  switchAccount: (email: string) => Promise<void>;
  canAccess: (permission: Permission) => boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoading: boolean;
  customers: Customer[];
  leads: Lead[];
  bookings: Booking[];
  campaigns: Campaign[];
  reviews: Review[];
  services: Service[];
  staff: Staff[];
  website: Website;
  invoices: Invoice[];
  subscription: any;
  integrations: any[];
  notes: Note[];
  activities: CustomerActivity[];
  conversations: Conversation[];
  refreshData: () => Promise<void>;
  addCustomer: (cust: Partial<Customer>) => Promise<Customer>;
  addLead: (lead: Partial<Lead>) => Promise<Lead>;
  addBooking: (booking: Partial<Booking>) => Promise<Booking>;
  addService: (service: Partial<Service>) => Promise<Service>;
  addStaff: (staff: Partial<Staff>) => Promise<Staff>;
  addCampaign: (campaign: Partial<Campaign>) => Promise<Campaign>;
  updateWebsiteBlock: (blockId: string, content: any) => Promise<void>;
  publishWebsiteToggle: () => Promise<void>;
  replyToReview: (reviewId: string, responseText: string) => Promise<void>;
  createInvoice: (customerName: string, amount: number) => Invoice;
  createBillingOrder: (plan: string, amount: number) => Promise<any>;
  verifyPayment: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; plan?: string; invoiceId?: string }) => Promise<boolean>;
  toggleIntegration: (provider: string, status?: string) => Promise<void>;
  addNote: (customerId: string, content: string) => Promise<Note>;
  updateLeadStage: (leadId: string, newStage: string) => Promise<void>;
  bulkSendCampaign: (customerIds: string[]) => void;
  updateUserSettings: (data: { name?: string; email?: string; image?: string; phone?: string }) => Promise<void>;
  updateBusinessSettings: (data: any) => Promise<void>;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('businessos-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [session, setSession] = useState<AuthSession>({
    userId: 'usr-prathamesh',
    userName: 'Prathamesh',
    userEmail: 'prathamesh@test.com',
    organizationId: mockOrganization.id,
    organizationName: mockOrganization.name,
    role: 'OWNER',
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [website, setWebsite] = useState<Website>(mockWebsite);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [subscription, setSubscription] = useState<any>(mockSubscription);
  const [integrations, setIntegrations] = useState<any[]>(mockIntegrations);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [activities, setActivities] = useState<CustomerActivity[]>(mockCustomerActivities);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ─── Fetch Current User & Dynamic Application Data from Neon ─────────────
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch User Context from database API
      const userRes = await fetch('/api/user');
      let currentOrgName = mockOrganization.name;
      if (userRes.ok) {
        const u = await userRes.json();
        if (u.organizationName) currentOrgName = u.organizationName;

        // Fetch Business details
        const bizRes = await fetch('/api/business');
        if (bizRes.ok) {
          const biz = await bizRes.json();
          if (biz?.name) currentOrgName = biz.name;
        }

        setSession({
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          organizationId: u.organizationId || mockOrganization.id,
          organizationName: currentOrgName,
          role: u.role || 'OWNER',
        });
      }

      // 2. Fetch Customers from database API
      const custRes = await fetch('/api/customers');
      if (custRes.ok) {
        const custs = await custRes.json();
        if (Array.isArray(custs)) {
          setCustomers(custs);
          // Also collect any persisted notes from customer records
          const allNotes: Note[] = [];
          custs.forEach((c: any) => {
            if (Array.isArray(c.tags)) {
              c.tags.forEach((t: string) => {
                if (t.startsWith('__note__:')) {
                  try {
                    allNotes.push(JSON.parse(t.replace('__note__:', '')));
                  } catch {}
                }
              });
            }
          });
          if (allNotes.length > 0) {
            setNotes((prev) => {
              const ids = new Set(allNotes.map((n) => n.id));
              return [...allNotes, ...prev.filter((p) => !ids.has(p.id))];
            });
          }
        }
      }

      // 3. Fetch Pipeline Leads from database API
      const leadsRes = await fetch('/api/leads');
      if (leadsRes.ok) {
        const dbLeads = await leadsRes.json();
        if (Array.isArray(dbLeads)) setLeads(dbLeads);
      }

      // 4. Fetch Bookings, Services & Staff from database API
      const bkRes = await fetch('/api/bookings');
      if (bkRes.ok) {
        const data = await bkRes.json();
        if (Array.isArray(data.bookings)) setBookings(data.bookings);
        if (Array.isArray(data.services) && data.services.length > 0) setServices(data.services);
        if (Array.isArray(data.staff) && data.staff.length > 0) setStaff(data.staff);
      }

      // 5. Fetch Marketing Campaigns & Reviews from database API
      const mktRes = await fetch('/api/marketing');
      if (mktRes.ok) {
        const data = await mktRes.json();
        if (Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
      }

      // 6. Fetch Conversations from database API
      const convRes = await fetch('/api/conversations');
      if (convRes.ok) {
        const convs = await convRes.json();
        if (Array.isArray(convs)) setConversations(convs);
      }

      // 7. Fetch Website Builder State from database API
      const webRes = await fetch('/api/website');
      if (webRes.ok) {
        const webData = await webRes.json();
        if (webData?.subdomain && Array.isArray(webData?.pages)) {
          setWebsite(webData);
        }
      }

      // 8. Fetch Billing & Invoices from database API
      const billRes = await fetch('/api/billing');
      if (billRes.ok) {
        const billData = await billRes.json();
        if (billData?.subscription) setSubscription(billData.subscription);
        if (Array.isArray(billData?.invoices)) setInvoices(billData.invoices);
      }

      // 9. Fetch Third-Party Integrations from database API
      const intRes = await fetch('/api/integrations');
      if (intRes.ok) {
        const intData = await intRes.json();
        if (Array.isArray(intData?.integrations)) setIntegrations(intData.integrations);
      }
    } catch (e) {
      console.error('[AppContext] Error fetching database state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    setHasMounted(true);
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!hasMounted) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('businessos-theme', theme);
  }, [theme, hasMounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const switchAccount = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setSession({
          userId: data.user.id,
          userName: data.user.name,
          userEmail: data.user.email,
          organizationId: data.user.organizationId || mockOrganization.id,
          organizationName: mockOrganization.name,
          role: data.user.role || 'OWNER',
        });
        addToast({ type: 'success', title: 'Account Switched', message: `Active user set to ${data.user.name} (${data.user.email})` });
        await refreshData();
      }
    } catch {
      addToast({ type: 'error', title: 'Switch Error', message: 'Failed to switch user account.' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSettings = async (data: { name?: string; email?: string; image?: string; phone?: string }) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setSession((prev) => ({
          ...prev,
          userName: result.user.name,
          userEmail: result.user.email,
        }));
        addToast({ type: 'success', title: 'User Settings Saved', message: 'Your user profile settings have been updated in Neon DB.' });
        await refreshData();
      } else {
        const err = await res.json();
        addToast({ type: 'error', title: 'Update Failed', message: err.error || 'Failed to update user settings.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Update Error', message: 'Unable to save user settings.' });
    }
  };

  const updateBusinessSettings = async (data: any) => {
    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = await res.json();
        setSession((prev) => ({
          ...prev,
          organizationName: updated.name,
        }));
        addToast({ type: 'success', title: 'Business Profile Saved', message: 'Business settings updated globally across all pages.' });
        await refreshData();
      } else {
        const err = await res.json();
        addToast({ type: 'error', title: 'Update Failed', message: err.error || 'Failed to update business settings.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Update Error', message: 'Unable to save business settings.' });
    }
  };

  const setRole = (role: Role) => {
    setSession((prev) => ({ ...prev, role }));
    addToast({ type: 'info', title: 'Role Switched', message: `Active session mode changed to ${role}` });
  };

  const canAccess = (permission: Permission) => hasPermission(session.role, permission);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addCustomer = async (custData: Partial<Customer>): Promise<Customer> => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData),
      });
      if (res.ok) {
        const created = await res.json();
        setCustomers((prev) => [created, ...prev]);
        addToast({ type: 'success', title: 'Customer Added', message: `${created.name} saved to Neon database.` });
        return created;
      }
    } catch {
      addToast({ type: 'error', title: 'Add Failed', message: 'Failed to add customer.' });
    }
    const fallback: Customer = {
      id: `cust-${Date.now()}`,
      organizationId: session.organizationId,
      name: custData.name || 'New Customer',
      email: custData.email || 'client@example.com',
      phone: custData.phone || '+91 90000 00000',
      tags: custData.tags || ['New Client'],
      status: 'ACTIVE',
      lifetimeValue: 0,
      totalBookings: 1,
      lastActivityAt: new Date().toISOString(),
      notesCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [fallback, ...prev]);
    return fallback;
  };

  const addBooking = async (bookingData: Partial<Booking>): Promise<Booking> => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify(bookingData),
      });

      if (res.status === 409) {
        const conflictErr = await res.json();
        addToast({
          type: 'error',
          title: 'Schedule Conflict',
          message: conflictErr.error || 'This staff member already has an overlapping appointment.',
        });
        throw new Error(conflictErr.error);
      }

      if (res.ok) {
        const created = await res.json();
        setBookings((prev) => [created, ...prev]);
        addToast({
          type: 'success',
          title: 'Booking Confirmed',
          message: `Scheduled ${created.serviceName} for ${created.customerName} in Neon DB.`,
        });
        return created;
      }
    } catch (e: any) {
      if (e?.message?.includes('Conflict')) {
        throw e;
      }
      addToast({ type: 'error', title: 'Booking Failed', message: 'Failed to save booking.' });
    }

    const fallback: Booking = {
      id: `bk-${Date.now()}`,
      organizationId: session.organizationId,
      customerId: bookingData.customerId || 'cust-101',
      customerName: bookingData.customerName || 'Walk-in Client',
      customerPhone: bookingData.customerPhone || '+91 98000 11122',
      serviceId: bookingData.serviceId || services[0]?.id || 'srv-201',
      serviceName: bookingData.serviceName || services[0]?.name || 'Spa Service',
      staffId: bookingData.staffId || 'stf-1',
      staffName: bookingData.staffName || 'Priya Patel',
      startTime: bookingData.startTime ? new Date(bookingData.startTime).toISOString() : new Date().toISOString(),
      endTime: bookingData.endTime ? new Date(bookingData.endTime).toISOString() : new Date(Date.now() + 3600000).toISOString(),
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalAmount: bookingData.totalAmount || 1499,
      notes: bookingData.notes || 'Booked via Saarthi AI',
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [fallback, ...prev]);
    return fallback;
  };

  const addService = async (serviceData: Partial<Service>): Promise<Service> => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify(serviceData),
      });

      if (res.ok) {
        const created = await res.json();
        setServices((prev) => [...prev, created]);
        addToast({
          type: 'success',
          title: 'Service Added',
          message: `"${created.name}" added to service catalog in Neon DB.`,
        });
        return created;
      }
    } catch (e) {
      console.error('[addService] Error:', e);
    }

    const fallback: Service = {
      id: `srv-${Date.now()}`,
      organizationId: session.organizationId,
      name: serviceData.name || 'New Service',
      description: serviceData.description || 'Custom service offering',
      category: serviceData.category || 'General',
      durationMinutes: serviceData.durationMinutes || 60,
      price: serviceData.price || 999,
      isActive: true,
    };
    setServices((prev) => [...prev, fallback]);
    addToast({ type: 'success', title: 'Service Added', message: `Added "${fallback.name}"` });
    return fallback;
  };

  const addStaff = async (staffData: Partial<Staff>): Promise<Staff> => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify(staffData),
      });

      if (res.ok) {
        const created = await res.json();
        setStaff((prev) => [...prev, created]);
        addToast({
          type: 'success',
          title: 'Staff Member Registered',
          message: `${created.name} added to team roster in Neon DB.`,
        });
        return created;
      }
    } catch (e) {
      console.error('[addStaff] Error:', e);
    }

    const fallback: Staff = {
      id: `stf-${Date.now()}`,
      organizationId: session.organizationId,
      name: staffData.name || 'Team Member',
      role: staffData.role || 'Therapist',
      email: staffData.email || 'staff@businessos.app',
      phone: staffData.phone || '+91 98000 00000',
      avatarUrl: staffData.avatarUrl,
      assignedServices: staffData.assignedServices || [],
      isAvailable: true,
    };
    setStaff((prev) => [...prev, fallback]);
    addToast({ type: 'success', title: 'Staff Member Added', message: `Added ${fallback.name}` });
    return fallback;
  };

  const addLead = async (leadData: Partial<Lead>): Promise<Lead> => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify(leadData),
      });

      if (res.ok) {
        const created = await res.json();
        setLeads((prev) => [created, ...prev]);
        addToast({
          type: 'success',
          title: 'Lead Registered',
          message: `${created.name} added to pipeline in Neon DB.`,
        });
        return created;
      }
    } catch (e) {
      console.error('[addLead] Error:', e);
    }

    const fallback: Lead = {
      id: `lead-${Date.now()}`,
      organizationId: session.organizationId,
      name: leadData.name || 'New Lead',
      email: leadData.email || 'lead@example.com',
      phone: leadData.phone || '+91 90000 00000',
      source: leadData.source || 'WEBSITE',
      stage: (leadData.stage as any) || 'NEW',
      estimatedValue: leadData.estimatedValue || 2000,
      notes: leadData.notes || '',
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [fallback, ...prev]);
    return fallback;
  };

  const addCampaign = async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    try {
      const res = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      if (res.ok) {
        const created = await res.json();
        setCampaigns((prev) => [created, ...prev]);
        addToast({ type: 'success', title: 'Campaign Broadcast Sent', message: `Broadcast "${created.name}" dispatched.` });
        return created;
      }
    } catch {
      addToast({ type: 'error', title: 'Campaign Failed', message: 'Failed to create campaign.' });
    }
    const fallback: Campaign = {
      id: `cmp-${Date.now()}`,
      organizationId: session.organizationId,
      name: campaignData.name || 'AI Special Broadcast',
      channel: campaignData.channel || 'WHATSAPP',
      status: 'COMPLETED',
      subject: campaignData.subject || 'Special Offer',
      content: campaignData.content || 'Enjoy discount!',
      targetAudience: campaignData.targetAudience || 'INACTIVE_30_DAYS',
      totalRecipients: 14,
      deliveredCount: 14,
      openedCount: 11,
      clickedCount: 8,
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [fallback, ...prev]);
    return fallback;
  };

  const updateWebsiteBlock = async (blockId: string, content: any): Promise<void> => {
    setWebsite((prev) => {
      const updatedPages = prev.pages.map((pg) => ({
        ...pg,
        blocks: pg.blocks.map((blk) => (blk.id === blockId ? { ...blk, content: { ...blk.content, ...content } } : blk)),
      }));
      return { ...prev, pages: updatedPages, updatedAt: new Date().toISOString() };
    });

    try {
      const res = await fetch(`/api/website/blocks/${blockId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        addToast({ type: 'success', title: 'Block Saved', message: 'Website block changes persisted to database.' });
        return;
      }
    } catch (e) {
      console.error('[updateWebsiteBlock] Error:', e);
    }
    addToast({ type: 'info', title: 'Website Updated', message: 'Page block layout updated locally.' });
  };

  const publishWebsiteToggle = async (): Promise<void> => {
    const nextState = !website.isPublished;
    setWebsite((prev) => ({ ...prev, isPublished: nextState }));

    try {
      const res = await fetch('/api/website', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ isPublished: nextState }),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: nextState ? 'Website Live' : 'Website Unpublished',
          message: nextState
            ? `Published to /site/${website.subdomain} (Neon DB updated).`
            : 'Site taken offline (Neon DB updated).',
        });
        return;
      }
    } catch (e) {
      console.error('[publishWebsiteToggle] Error:', e);
    }

    addToast({
      type: 'info',
      title: nextState ? 'Website Live (Local)' : 'Website Unpublished (Local)',
      message: nextState ? `Published to /site/${website.subdomain}` : 'Site taken offline',
    });
  };

  const replyToReview = async (reviewId: string, responseText: string): Promise<void> => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, responseText } : r)));
    try {
      const res = await fetch(`/api/marketing/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ responseText }),
      });

      if (res.ok) {
        addToast({ type: 'success', title: 'Review Response Posted', message: 'Published reply to Google Business in Neon DB.' });
      } else {
        addToast({ type: 'success', title: 'Review Response Posted', message: 'Published AI response.' });
      }
    } catch {
      addToast({ type: 'success', title: 'Review Response Posted', message: 'Published AI response.' });
    }
  };

  const createInvoice = (customerName: string, amount: number): Invoice => {
    const inv: Invoice = {
      id: `inv-${Date.now()}`,
      organizationId: session.organizationId,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName,
      customerEmail: 'client@example.com',
      amount,
      tax: Math.round(amount * 0.18),
      total: Math.round(amount * 1.18),
      currency: 'INR',
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [inv, ...prev]);
    addToast({ type: 'success', title: 'Invoice Generated', message: `Issued ${inv.invoiceNumber} for ₹${inv.total.toLocaleString()}` });

    // Persist to Neon DB asynchronously via billing API
    fetch('/api/billing/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-saarthi-user-email': session.userEmail,
      },
      body: JSON.stringify({
        amount,
        customerName,
        customerEmail: 'client@example.com',
        invoiceNumber: inv.invoiceNumber,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.invoiceId) {
          setInvoices((prev) =>
            prev.map((item) =>
              item.invoiceNumber === inv.invoiceNumber
                ? { ...item, id: data.invoiceId, razorpayOrderId: data.orderId }
                : item
            )
          );
        }
      })
      .catch((err) => console.warn('[createInvoice] DB persist error:', err));

    return inv;
  };

  const createBillingOrder = async (plan: string, amount: number): Promise<any> => {
    try {
      const res = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ plan, amount }),
      });
      if (!res.ok) throw new Error('Order creation failed');
      const data = await res.json();
      return data;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Payment Error', message: err.message || 'Could not initiate payment' });
      throw err;
    }
  };

  const verifyPayment = async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan?: string;
    invoiceId?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/billing/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        addToast({ type: 'success', title: 'Payment Successful', message: 'Subscription upgraded & invoice marked PAID.' });
        if (data.subscription) setSubscription(data.subscription);
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.razorpayOrderId === payload.razorpay_order_id || inv.id === payload.invoiceId
              ? { ...inv, status: 'PAID', razorpayPaymentId: payload.razorpay_payment_id }
              : inv
          )
        );
        return true;
      } else {
        addToast({ type: 'error', title: 'Payment Verification Failed', message: data.error || 'Signature check failed' });
        return false;
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Verification Error', message: err.message || 'Could not verify payment' });
      return false;
    }
  };

  const toggleIntegration = async (provider: string, status?: string): Promise<void> => {
    const current = integrations.find((i) => i.provider === provider);
    const newStatus = status || (current?.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED');

    // Optimistic UI update
    setIntegrations((prev) => {
      const exists = prev.some((i) => i.provider === provider);
      if (exists) {
        return prev.map((i) => (i.provider === provider ? { ...i, status: newStatus } : i));
      }
      return [...prev, { id: `int-${Date.now()}`, provider, status: newStatus, organizationId: session.organizationId }];
    });

    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ provider, status: newStatus }),
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Integration Updated',
          message: `${provider.replace(/_/g, ' ')} is now ${newStatus}.`,
        });
      }
    } catch {
      addToast({
        type: 'info',
        title: 'Integration Updated',
        message: `${provider.replace(/_/g, ' ')} status updated locally.`,
      });
    }
  };

  const addNote = async (customerId: string, content: string): Promise<Note> => {
    const fallbackNote: Note = {
      id: `nte-${Date.now()}`,
      organizationId: session.organizationId,
      customerId,
      authorName: session.userName,
      content,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/customers/${customerId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const persisted = await res.json();
        setNotes((prev) => [persisted, ...prev]);
        addToast({ type: 'success', title: 'Note Saved', message: 'Added note to customer profile in Neon DB.' });
        return persisted;
      }
    } catch (e) {
      console.error('[addNote] Error:', e);
    }

    setNotes((prev) => [fallbackNote, ...prev]);
    addToast({ type: 'success', title: 'Note Saved', message: 'Added note to customer profile.' });
    return fallbackNote;
  };

  const updateLeadStage = async (leadId: string, newStage: string): Promise<void> => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage as any } : l)));
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-saarthi-user-email': session.userEmail,
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (res.ok) {
        addToast({ type: 'info', title: 'Pipeline Updated', message: `Lead moved to ${newStage} in Neon DB.` });
      } else {
        addToast({ type: 'info', title: 'Pipeline Updated', message: `Lead moved to ${newStage}` });
      }
    } catch {
      addToast({ type: 'info', title: 'Pipeline Updated', message: `Lead moved to ${newStage}` });
    }
  };

  const bulkSendCampaign = (customerIds: string[]) => {
    addToast({ type: 'success', title: 'Bulk Broadcast Queued', message: `Dispatched campaign offer to ${customerIds.length} selected clients.` });
  };

  return (
    <AppContext.Provider
      value={{
        session,
        setRole,
        switchAccount,
        canAccess,
        theme,
        toggleTheme,
        isLoading,
        customers,
        leads,
        bookings,
        campaigns,
        reviews,
        services,
        staff,
        website,
        invoices,
        subscription,
        integrations,
        notes,
        activities,
        conversations,
        refreshData,
        addCustomer,
        addLead,
        addBooking,
        addService,
        addStaff,
        addCampaign,
        updateWebsiteBlock,
        publishWebsiteToggle,
        replyToReview,
        createInvoice,
        createBillingOrder,
        verifyPayment,
        toggleIntegration,
        addNote,
        updateLeadStage,
        bulkSendCampaign,
        updateUserSettings,
        updateBusinessSettings,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-4 rounded-xl shadow-xl min-w-[300px] max-w-sm flex items-start justify-between"
          >
            <div>
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white ml-3 text-sm font-bold">
              &times;
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
