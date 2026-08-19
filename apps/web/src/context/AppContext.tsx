'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthSession, ROLE_PERMISSIONS, hasPermission } from '@businessos/auth';
import {
  Booking,
  Campaign,
  Conversation,
  Customer,
  CustomerActivity,
  Invoice,
  Lead,
  Note,
  Permission,
  Review,
  Role,
  Service,
  Website,
} from '@businessos/shared';
import {
  mockBookings,
  mockBusinessProfile,
  mockCampaigns,
  mockConversations,
  mockCustomerActivities,
  mockCustomers,
  mockInvoices,
  mockLeads,
  mockMemberships,
  mockNotes,
  mockOrganization,
  mockReviews,
  mockServices,
  mockStaff,
  mockWebsite,
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
  canAccess: (permission: Permission) => boolean;

  // Dark Mode Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Domain State
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

  // Data Actions
  addCustomer: (cust: Partial<Customer>) => Customer;
  addBooking: (booking: Partial<Booking>) => Booking;
  addCampaign: (campaign: Partial<Campaign>) => Campaign;
  updateWebsiteBlock: (blockId: string, content: any) => void;
  publishWebsiteToggle: () => void;
  replyToReview: (reviewId: string, responseText: string) => void;
  createInvoice: (customerName: string, amount: number) => Invoice;
  addNote: (customerId: string, content: string) => Note;
  updateLeadStage: (leadId: string, newStage: string) => void;
  bulkSendCampaign: (customerIds: string[]) => void;

  // Toast Notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [session, setSession] = useState<AuthSession>({
    userId: 'usr-1',
    userName: 'Ananya Verma',
    userEmail: 'ananya@luminaluxe.com',
    organizationId: mockOrganization.id,
    organizationName: mockOrganization.name,
    role: 'OWNER',
  });

  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [services] = useState<Service[]>(mockServices);
  const [website, setWebsite] = useState<Website>(mockWebsite);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [activities, setActivities] = useState<CustomerActivity[]>(mockCustomerActivities);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    addToast({ type: 'info', title: 'Theme Switched', message: `Active theme changed to ${nextTheme.toUpperCase()} mode.` });
  };

  const setRole = (role: Role) => {
    setSession((prev) => ({ ...prev, role }));
    addToast({
      type: 'info',
      title: 'Role Switched',
      message: `Active session mode changed to ${role}`,
    });
  };

  const canAccess = (permission: Permission) => {
    return hasPermission(session.role, permission);
  };

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

  const addCustomer = (custData: Partial<Customer>): Customer => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      organizationId: session.organizationId,
      name: custData.name || 'New Customer',
      email: custData.email || 'client@example.com',
      phone: custData.phone || '+91 90000 00000',
      tags: custData.tags || ['New Client'],
      status: custData.status || 'ACTIVE',
      lifetimeValue: custData.lifetimeValue || 0,
      totalBookings: custData.totalBookings || 1,
      lastActivityAt: new Date().toISOString(),
      notesCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);

    const act: CustomerActivity = {
      id: `act-${Date.now()}`,
      organizationId: session.organizationId,
      customerId: newCust.id,
      type: 'NOTE_ADDED',
      title: 'Customer Added',
      description: `Registered new client profile ${newCust.name}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({ type: 'success', title: 'Customer Added', message: `${newCust.name} added to repository.` });
    return newCust;
  };

  const addBooking = (bookingData: Partial<Booking>): Booking => {
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      organizationId: session.organizationId,
      customerId: bookingData.customerId || 'cust-101',
      customerName: bookingData.customerName || 'Walk-in Client',
      customerPhone: bookingData.customerPhone || '+91 98000 11122',
      serviceId: bookingData.serviceId || services[0].id,
      serviceName: bookingData.serviceName || services[0].name,
      staffId: bookingData.staffId || mockStaff[0].id,
      staffName: bookingData.staffName || mockStaff[0].name,
      startTime: bookingData.startTime || new Date().toISOString(),
      endTime: bookingData.endTime || new Date(Date.now() + 3600000).toISOString(),
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalAmount: bookingData.totalAmount || services[0].price,
      notes: bookingData.notes || 'Booked via BusinessOS AI',
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);

    const act: CustomerActivity = {
      id: `act-${Date.now()}`,
      organizationId: session.organizationId,
      customerId: newBooking.customerId,
      type: 'BOOKING_CREATED',
      title: 'Appointment Scheduled',
      description: `Scheduled ${newBooking.serviceName} with ${newBooking.staffName}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({ type: 'success', title: 'Booking Confirmed', message: `Scheduled ${newBooking.serviceName} for ${newBooking.customerName}` });
    return newBooking;
  };

  const addCampaign = (campaignData: Partial<Campaign>): Campaign => {
    const newCampaign: Campaign = {
      id: `cmp-${Date.now()}`,
      organizationId: session.organizationId,
      name: campaignData.name || 'AI Special Broadcast',
      channel: campaignData.channel || 'WHATSAPP',
      status: 'COMPLETED',
      subject: campaignData.subject || 'Special Offer for You',
      content: campaignData.content || 'Enjoy 20% discount on your next visit!',
      targetAudience: campaignData.targetAudience || 'INACTIVE_30_DAYS',
      totalRecipients: 14,
      deliveredCount: 14,
      openedCount: 11,
      clickedCount: 8,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    addToast({ type: 'success', title: 'Campaign Broadcast Sent', message: `Broadcast sent to 14 recipients.` });
    return newCampaign;
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
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, responseText, respondedAt: new Date().toISOString() } : r))
    );
    addToast({ type: 'success', title: 'Review Response Posted', message: 'Published AI response to Google Business.' });
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
      razorpayOrderId: `order_rzp_sim_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [inv, ...prev]);

    const act: CustomerActivity = {
      id: `act-${Date.now()}`,
      organizationId: session.organizationId,
      customerId: 'cust-101',
      type: 'INVOICE_SENT',
      title: 'Invoice Issued',
      description: `Issued ${inv.invoiceNumber} for ₹${inv.total.toLocaleString()}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

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

    const act: CustomerActivity = {
      id: `act-${Date.now()}`,
      organizationId: session.organizationId,
      customerId,
      type: 'NOTE_ADDED',
      title: 'Note Added',
      description: content,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [act, ...prev]);

    addToast({ type: 'success', title: 'Note Saved', message: 'Added note to customer profile.' });
    return newNote;
  };

  const updateLeadStage = (leadId: string, newStage: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage as any } : l)));
    addToast({ type: 'info', title: 'Pipeline Updated', message: `Lead moved to ${newStage}` });
  };

  const bulkSendCampaign = (customerIds: string[]) => {
    addToast({
      type: 'success',
      title: 'Bulk Broadcast Queued',
      message: `Dispatched campaign offer to ${customerIds.length} selected clients.`,
    });
  };

  return (
    <AppContext.Provider
      value={{
        session,
        setRole,
        canAccess,
        theme,
        toggleTheme,
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
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-xl min-w-[300px] max-w-sm flex items-start justify-between transform transition-all duration-300 animate-slide-in"
          >
            <div>
              <h4 className="font-semibold text-sm text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 ml-3 text-sm font-bold"
            >
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
