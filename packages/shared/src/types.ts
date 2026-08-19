// Role & Access Levels
export type Role = 'OWNER' | 'MANAGER' | 'STAFF';

export type Permission =
  | 'org:read'
  | 'org:write'
  | 'org:billing'
  | 'customers:read'
  | 'customers:write'
  | 'customers:delete'
  | 'bookings:read'
  | 'bookings:write'
  | 'bookings:delete'
  | 'marketing:read'
  | 'marketing:write'
  | 'website:read'
  | 'website:write'
  | 'ai:execute'
  | 'settings:read'
  | 'settings:write';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  permissions: Permission[];
  user?: User;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  organizationId: string;
  businessType: 'SALON' | 'CLINIC' | 'RESTAURANT' | 'GYM' | 'REAL_ESTATE' | 'AGENCY' | 'CONSULTANT' | 'REPAIR' | 'OTHER';
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  websiteUrl?: string;
  googleRating?: number;
  totalReviews?: number;
  operatingHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'VIP' | 'CHURNED';
  lifetimeValue: number;
  totalBookings: number;
  lastActivityAt: string;
  notesCount: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  source: 'WEBSITE' | 'GOOGLE' | 'CAMPAIGN' | 'MANUAL' | 'INSTAGRAM' | 'REFERRAL';
  stage: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
  estimatedValue: number;
  notes?: string;
  assignedStaffId?: string;
  createdAt: string;
}

export interface CustomerActivity {
  id: string;
  organizationId: string;
  customerId: string;
  type: 'BOOKING_CREATED' | 'CAMPAIGN_SENT' | 'NOTE_ADDED' | 'REVIEW_RECEIVED' | 'CALL_LOGGED' | 'INVOICE_SENT';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Note {
  id: string;
  organizationId: string;
  customerId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  organizationId: string;
  customerId: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'WEBSITE_CHAT';
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface Staff {
  id: string;
  organizationId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  assignedServices: string[];
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL' | 'REFUNDED';
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  subject?: string;
  content: string;
  targetAudience: 'ALL' | 'INACTIVE_30_DAYS' | 'VIP_CUSTOMERS' | 'NEW_LEADS';
  totalRecipients: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  customerId: string;
  customerName: string;
  customerEmailOrPhone: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'OPENED' | 'CLICKED';
  sentAt?: string;
}

export interface Review {
  id: string;
  organizationId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  platform: 'GOOGLE' | 'YELP' | 'FACEBOOK' | 'DIRECT';
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  aiSuggestedResponse?: string;
  responseText?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface WebsiteBlock {
  id: string;
  type: 'HERO' | 'SERVICES' | 'TESTIMONIALS' | 'CTA' | 'CONTACT' | 'FEATURES' | 'GALLERY' | 'PRICING' | 'FAQ' | 'FOOTER';
  title: string;
  subtitle?: string;
  content: Record<string, any>;
  order: number;
}

export interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  metaDescription: string;
  blocks: WebsiteBlock[];
}

export interface Website {
  id: string;
  organizationId: string;
  domainName: string;
  subdomain: string;
  isPublished: boolean;
  themeColor: string;
  fontFamily: string;
  pages: WebsitePage[];
  updatedAt: string;
}

export interface AIAction {
  id: string;
  organizationId: string;
  conversationId: string;
  intent: string;
  toolName: string;
  parameters: Record<string, any>;
  status: 'PENDING_APPROVAL' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  result?: any;
  securityVerdict: 'ALLOWED' | 'DENIED_PERMISSIONS' | 'REQUIRES_CONFIRMATION';
  executedByRole: Role;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  sender: 'USER' | 'AI' | 'SYSTEM';
  content: string;
  actionRequested?: AIAction;
  suggestedPrompts?: string[];
  createdAt: string;
}

export interface AIConversation {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  updatedAt: string;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  assignedToRole?: Role;
  assignedStaffId?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: 'BOOKING' | 'CAMPAIGN' | 'REVIEW' | 'AI_ACTION' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Integration {
  id: string;
  organizationId: string;
  provider: 'RAZORPAY' | 'GOOGLE_BUSINESS' | 'WHATSAPP' | 'OPENAI' | 'META_ADS';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  connectedAt?: string;
  config?: Record<string, any>;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  amount: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'YEARLY';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  razorpaySubscriptionId?: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'DRAFT' | 'PAID' | 'UNPAID' | 'OVERDUE';
  dueDate: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}
