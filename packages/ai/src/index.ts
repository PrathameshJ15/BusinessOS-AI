import { AuthSession, hasPermission, logSecurityAudit } from '@businessos/auth';
import { AIAction, Permission } from '@businessos/shared';

export type AIProvider = 'openai' | 'groq' | 'anthropic' | 'gemini' | 'mock';

export interface AIResponse {
  message: string;
  providerUsed: AIProvider;
  actionRequested?: {
    toolName: string;
    intent: string;
    parameters: Record<string, any>;
    requiredPermission: Permission;
    executionResult?: any;
    status: 'COMPLETED' | 'PENDING_APPROVAL' | 'DENIED_PERMISSIONS';
  };
  suggestedPrompts?: string[];
}

export interface IAIService {
  providerName: AIProvider;
  generateCompletion(prompt: string, context?: Record<string, any>): Promise<string>;
  processUserCommand(prompt: string, session: AuthSession, context?: Record<string, any>): Promise<AIResponse>;
}

// Base mock/smart engine that resolves tools & actions
export class UnifiedAIService implements IAIService {
  constructor(public providerName: AIProvider = 'mock') {}

  async generateCompletion(prompt: string, context?: Record<string, any>): Promise<string> {
    return `[${this.providerName.toUpperCase()}] Response to "${prompt}": Analyzed context with ${Object.keys(context || {}).length} variables.`;
  }

  async processUserCommand(prompt: string, session: AuthSession, context?: Record<string, any>): Promise<AIResponse> {
    const lower = prompt.toLowerCase();

    let toolName = '';
    let intent = '';
    let requiredPermission: Permission = 'org:read';
    let parameters: Record<string, any> = {};
    let responseText = '';
    let executionResult: any = null;
    let suggestedPrompts: string[] = [];

    if (lower.includes('website') || lower.includes('build my website')) {
      toolName = 'BUILD_WEBSITE';
      intent = 'Build and publish interactive business website';
      requiredPermission = 'website:write';
      parameters = { theme: 'modern-slate', sections: ['hero', 'services', 'testimonials', 'contact'] };
      responseText = `I have generated a modern, high-converting business website layout tailored to your brand. The site includes a Hero section, Services showcase, Customer Reviews, and online Booking widget.`;
      executionResult = { websiteId: 'web-101', status: 'PUBLISHED', url: 'https://salon-express.businessos.app' };
      suggestedPrompts = ['Customize website colors', 'Add a new service page', 'Publish changes'];
    } else if (lower.includes('inactive customer') || lower.includes('inactive customers') || lower.includes('show inactive')) {
      toolName = 'GET_INACTIVE_CUSTOMERS';
      intent = 'Fetch customers with no activity in 30+ days';
      requiredPermission = 'customers:read';
      parameters = { inactiveDays: 30 };
      responseText = `Found 14 inactive customers who haven't booked or purchased in the last 30 days. Total estimated dormant lifetime value: $4,850.`;
      executionResult = { count: 14, segment: 'INACTIVE_30_DAYS' };
      suggestedPrompts = ['Send a 20% discount offer campaign', 'Export inactive customers', 'Create follow-up task'];
    } else if (lower.includes('sales down') || lower.includes('why are sales down') || lower.includes('revenue')) {
      toolName = 'ANALYZE_SALES_DROP';
      intent = 'Analyze monthly revenue decline and identify root causes';
      requiredPermission = 'org:read';
      parameters = { timeframe: 'THIS_MONTH' };
      responseText = `Sales analysis complete: Month-over-month revenue is down 12%. Primary factors: 1) 18% decline in weekend haircut bookings, 2) 3 recurring VIP clients haven't visited in 45 days. Recommended action: Launch a targeted SMS re-engagement campaign.`;
      executionResult = { dropPercentage: 12, topFactor: 'Weekend booking decline', potentialRevenueRecovery: 2400 };
      suggestedPrompts = ['Create weekend campaign', 'Offer VIP package', 'View detailed analytics'];
    } else if (lower.includes('invoice') || lower.includes('rahul')) {
      toolName = 'CREATE_INVOICE';
      intent = 'Generate and issue invoice';
      requiredPermission = 'org:billing';
      parameters = { customerName: 'Rahul Sharma', amount: 250, description: 'Premium Business Consultation & Setup' };
      responseText = `Drafted Invoice #INV-2026-089 for Rahul Sharma ($250.00). Razorpay payment link ready to send via WhatsApp or SMS.`;
      executionResult = { invoiceId: 'inv-89', invoiceNumber: 'INV-2026-089', paymentLink: 'https://rzp.io/i/sim_inv89' };
      suggestedPrompts = ['Send invoice via WhatsApp', 'Mark as paid', 'Download PDF'];
    } else if (lower.includes('campaign') || lower.includes('offer') || lower.includes('send an offer')) {
      toolName = 'CREATE_MARKETING_CAMPAIGN';
      intent = 'Create and dispatch promotional marketing campaign';
      requiredPermission = 'marketing:write';
      parameters = { audience: 'INACTIVE_30_DAYS', channel: 'WHATSAPP', promoCode: 'COMEBACK20' };
      responseText = `Created WhatsApp & SMS campaign "Re-engage Inactive Clients (20% Off)". Target audience: 14 inactive clients. Ready for instant broadcast.`;
      executionResult = { campaignId: 'camp-302', recipientCount: 14, scheduledTime: 'IMMEDIATE' };
      suggestedPrompts = ['Broadcast now', 'Preview message content', 'Adjust discount'];
    } else if (lower.includes('review') || lower.includes('google review')) {
      toolName = 'REPLY_GOOGLE_REVIEW';
      intent = 'Generate and post AI response to latest Google review';
      requiredPermission = 'marketing:write';
      parameters = { reviewId: 'rev-44', sentiment: 'POSITIVE' };
      responseText = `Analyzed 5-star review from Sarah M: "Best salon experience in town!". Generated response: "Thank you Sarah! We are thrilled you loved your session with Priya. Looking forward to welcoming you back soon!"`;
      executionResult = { reviewId: 'rev-44', action: 'POSTED_RESPONSE' };
      suggestedPrompts = ['Approve response', 'Edit response text', 'View all reviews'];
    } else if (lower.includes('lead') || lower.includes('pending leads')) {
      toolName = 'GET_PENDING_LEADS';
      intent = 'Retrieve new and uncontacted sales leads';
      requiredPermission = 'customers:read';
      parameters = { stageFilter: ['NEW', 'CONTACTED'] };
      responseText = `You currently have 8 pending leads valued at $6,200. 3 leads came from your website landing page today!`;
      executionResult = { count: 8, totalPipelineValue: 6200 };
      suggestedPrompts = ['Assign leads to staff', 'Send automated intro SMS', 'View sales pipeline'];
    } else if (lower.includes('appointment') || lower.includes('book')) {
      toolName = 'BOOK_APPOINTMENT';
      intent = 'Schedule service booking';
      requiredPermission = 'bookings:write';
      parameters = { service: 'Hair Styling & Spa', staff: 'Priya Patel', time: 'Tomorrow 3:00 PM' };
      responseText = `Created booking confirmation for "Hair Styling & Spa" with Priya Patel scheduled for tomorrow at 3:00 PM. SMS reminder sent to client.`;
      executionResult = { bookingId: 'bk-994', status: 'CONFIRMED' };
      suggestedPrompts = ['View calendar', 'Send SMS reminder', 'Reschedule booking'];
    } else {
      responseText = `I analyzed your request "${prompt}". BusinessOS AI is ready to execute actions across your website, customer list, bookings, marketing, and invoices. Try asking: "Send an offer to inactive customers" or "Create an invoice for Rahul".`;
      suggestedPrompts = [
        'Build my website',
        'Show my inactive customers',
        'Why are sales down this month?',
        'Create an invoice for Rahul',
        'Send an offer to inactive customers',
        'Reply to my latest Google review',
      ];
      return {
        message: responseText,
        providerUsed: this.providerName,
        suggestedPrompts,
      };
    }

    // Permission enforcement check
    const isAllowed = hasPermission(session.role, requiredPermission);

    logSecurityAudit({
      organizationId: session.organizationId,
      userId: session.userId,
      action: `AI_TOOL_${toolName}`,
      resource: toolName,
      verdict: isAllowed ? 'ALLOWED' : 'DENIED',
      metadata: { intent, requiredPermission, parameters },
    });

    if (!isAllowed) {
      return {
        message: `Security Enforcement: Action "${intent}" requires '${requiredPermission}' permission. Your current role is '${session.role}'. Contact your organization owner.`,
        providerUsed: this.providerName,
        actionRequested: {
          toolName,
          intent,
          parameters,
          requiredPermission,
          status: 'DENIED_PERMISSIONS',
        },
        suggestedPrompts,
      };
    }

    return {
      message: responseText,
      providerUsed: this.providerName,
      actionRequested: {
        toolName,
        intent,
        parameters,
        requiredPermission,
        executionResult,
        status: 'COMPLETED',
      },
      suggestedPrompts,
    };
  }
}

export function createAIService(provider: AIProvider = 'openai'): IAIService {
  return new UnifiedAIService(provider);
}
