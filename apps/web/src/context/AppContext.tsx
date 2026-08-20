'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthSession, hasPermission } from '@businessos/auth';
import {
  Booking, Campaign, Conversation, Customer, CustomerActivity, Invoice, Lead, Note, Permission, Review, Role, Service, Website,
} from '@businessos/shared';
import {
  mockBusinessProfile, mockCustomerActivities, mockInvoices, mockLeads, mockNotes, mockOrganization, mockServices, mockStaff, mockWebsite,
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
  website: Website;
  invoices: Invoice[];
  notes: Note[];
  activities: CustomerActivity[];
  conversations: Conversation[];
  refreshData: () => Promise<void>;
  addCustomer: (cust: Partial<Customer>) => Promise<Customer>;
  addBooking: (booking: Partial<Booking>) => Promise<Booking>;
  addCampaign: (campaign: Partial<Campaign>) => Promise<Campaign>;
  updateWebsiteBlock: (blockId: string, content: any) => void;
  publishWebsiteToggle: () => void;
  replyToReview: (reviewId: string, responseText: string) => void;
  createInvoice: (customerName: string, amount: number) => Invoice;
  addNote: (customerId: string, content: string) => Note;
  updateLeadStage: (leadId: string, newStage: string) => void;
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
  const [website, setWebsite] = useState<Website>(mockWebsite);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
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
        if (Array.isArray(custs)) setCustomers(custs);
      }

      // 3. Fetch Bookings from database API
      const bkRes = await fetch('/api/bookings');
      if (bkRes.ok) {
        const data = await bkRes.json();
        if (Array.isArray(data.bookings)) setBookings(data.bookings);
        if (Array.isArray(data.services) && data.services.length > 0) setServices(data.services);
      }

      // 4. Fetch Marketing Campaigns from database API
      const mktRes = await fetch('/api/marketing');
      if (mktRes.ok) {
        const data = await mktRes.json();
        if (Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
      }

      // 5. Fetch Conversations from database API
      const convRes = await fetch('/api/conversations');
      if (convRes.ok) {
        const convs = await convRes.json();
        if (Array.isArray(convs)) setConversations(convs);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (res.ok) {
        const created = await res.json();
        setBookings((prev) => [created, ...prev]);
        addToast({ type: 'success', title: 'Booking Confirmed', message: `Scheduled ${created.serviceName} for ${created.customerName}` });
        return created;
      }
    } catch {
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
      staffId: 'stf-1',
      staffName: 'Priya Patel',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalAmount: bookingData.totalAmount || 1499,
      notes: bookingData.notes || 'Booked via Saarthi AI',
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [fallback, ...prev]);
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

  const updateWebsiteBlock = (blockId: string, content: any) => {
    setWebsite((prev) => {
      const updatedPages = prev.pages.map((pg) => ({
        ...pg,
        blocks: pg.blocks.map((blk) => (blk.id === blockId ? { ...blk, content: { ...blk.content, ...content } } : blk)),
      }));
      return { ...prev, pages: updatedPages, updatedAt: new Date().toISOString() };
    });
    addToast({ type: 'info', title: 'Website Updated', message: 'Page block layout updated successfully.' });
  };

  const publishWebsiteToggle = () => {
    setWebsite((prev) => ({ ...prev, isPublished: !prev.isPublished }));
    addToast({
      type: 'success',
      title: website.isPublished ? 'Website Unpublished' : 'Website Live',
      message: website.isPublished ? 'Site taken offline' : `Published to https://${website.subdomain}.businessos.app`,
    });
  };

  const replyToReview = (reviewId: string, responseText: string) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, responseText } : r)));
    addToast({ type: 'success', title: 'Review Response Posted', message: 'Published AI response.' });
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
    return inv;
  };

  const addNote = (customerId: string, content: string): Note => {
    const newNote: Note = {
      id: `nte-${Date.now()}`,
      organizationId: session.organizationId,
      customerId,
      authorName: session.userName,
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    addToast({ type: 'success', title: 'Note Saved', message: 'Added note to customer profile.' });
    return newNote;
  };

  const updateLeadStage = (leadId: string, newStage: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage as any } : l)));
    addToast({ type: 'info', title: 'Pipeline Updated', message: `Lead moved to ${newStage}` });
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
        website,
        invoices,
        notes,
        activities,
        conversations,
        refreshData,
        addCustomer,
        addBooking,
        addCampaign,
        updateWebsiteBlock,
        publishWebsiteToggle,
        replyToReview,
        createInvoice,
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
