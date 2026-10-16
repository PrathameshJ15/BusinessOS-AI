import { AuthSession, hasPermission, logSecurityAudit } from '@businessos/auth';
import { AIAction, Permission } from '@businessos/shared';

export type AIProvider = 'openai' | 'groq' | 'anthropic' | 'gemini' | 'mock';

export interface AIResponse {
  message: string;
  providerUsed: AIProvider;
  progressStep?: string;
  actionRequested?: {
    toolName: string;
    intent: string;
    parameters: Record<string, any>;
    requiredPermission: Permission;
    isWriteAction?: boolean;
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

// Base Provider Engine
export class BaseAIProvider implements IAIService {
  constructor(public providerName: AIProvider = 'mock') {}

  async generateCompletion(prompt: string, context?: Record<string, any>): Promise<string> {
    return `[${this.providerName.toUpperCase()}] Response to "${prompt}": Analyzed context with ${Object.keys(context || {}).length} variables.`;
  }

  async processUserCommand(prompt: string, session: AuthSession, context?: Record<string, any>): Promise<AIResponse> {
    const lower = prompt.toLowerCase();

    let toolName = '';
    let intent = '';
    let requiredPermission: Permission = 'org:read';
    let isWriteAction = false;
    let parameters: Record<string, any> = {};
    let responseText = '';
    let executionResult: any = null;
    let progressStep = 'Analyzing business records...';
    let suggestedPrompts: string[] = [];

    if (lower.includes('website') || lower.includes('build my website')) {
      toolName = 'generate_website';
      intent = 'Build and publish interactive business website';
      requiredPermission = 'website:write';
      isWriteAction = true;
      progressStep = 'Building responsive page layout...';
      parameters = { theme: 'modern-slate', sections: ['hero', 'services', 'testimonials', 'contact'] };
      responseText = `I generated a modern business website structure tailored to your brand.`;
      executionResult = { websiteId: 'web-101', status: 'PUBLISHED', url: 'https://lumina-luxe.businessos.app' };
      suggestedPrompts = ['Customize website colors', 'Add a new service page', 'Publish changes'];
    } else if (lower.includes('inactive customer') || lower.includes('inactive customers') || lower.includes('show inactive')) {
      toolName = 'search_customers';
      intent = 'Fetch customers with no activity in 30+ days';
      requiredPermission = 'customers:read';
      progressStep = 'Searching dormant client accounts...';
      parameters = { inactiveDays: 30 };
      responseText = `Found 14 inactive customers who haven't booked or purchased in the last 30 days. Estimated dormant lifetime value: ₹48,500.`;
      executionResult = { count: 14, segment: 'INACTIVE_30_DAYS' };
      suggestedPrompts = ['Send a 20% discount offer campaign', 'Export inactive customers', 'Create follow-up task'];
    } else if (lower.includes('sales down') || lower.includes('why are sales down') || lower.includes('revenue') || lower.includes('performing')) {
      toolName = 'get_revenue_insights';
      intent = 'Analyze monthly revenue trends and identify performance factors';
      requiredPermission = 'org:read';
      progressStep = 'Calculating monthly sales metrics...';
      parameters = { timeframe: 'THIS_MONTH' };
      responseText = `Business Performance Analysis: Monthly revenue is ₹84,000 (+14% vs previous period). Top contributing service: Hydra-Facial & Glow Therapy (₹38,500).`;
      executionResult = { growth: 14, topService: 'Hydra-Facial & Glow Therapy', totalRevenue: 84000 };
      suggestedPrompts = ['Create weekend campaign', 'Offer VIP package', 'View detailed analytics'];
    } else if (lower.includes('invoice') || lower.includes('rahul')) {
      toolName = 'CREATE_INVOICE';
      intent = 'Generate and issue invoice';
      requiredPermission = 'org:billing';
      isWriteAction = true;
      progressStep = 'Generating Razorpay payment link...';
      parameters = { customerName: 'Rahul Sharma', amount: 1416, description: 'Executive Haircut & Scalp Spa' };
      responseText = `Generated Invoice #INV-2026-089 for Rahul Sharma (₹1,416.00). Payment link ready for instant WhatsApp delivery.`;
      executionResult = { invoiceId: 'inv-89', invoiceNumber: 'INV-2026-089', paymentLink: 'https://rzp.io/i/sim_inv89' };
      suggestedPrompts = ['Send invoice via WhatsApp', 'Mark as paid', 'Download PDF'];
    } else if (lower.includes('campaign') || lower.includes('offer') || lower.includes('send an offer')) {
      toolName = 'create_campaign';
      intent = 'Create and dispatch promotional marketing campaign';
      requiredPermission = 'marketing:write';
      isWriteAction = true;
      progressStep = 'Preparing WhatsApp broadcast queue...';
      parameters = { audience: 'INACTIVE_30_DAYS', channel: 'WHATSAPP', promoCode: 'GLOW20' };
      responseText = `Drafted WhatsApp campaign "Re-engage Inactive Clients (20% Off)". Target: 14 inactive clients. Requires confirmation before broadcast.`;
      executionResult = { campaignId: 'camp-302', recipientCount: 14, scheduledTime: 'IMMEDIATE' };
      suggestedPrompts = ['Broadcast now', 'Preview message content', 'Adjust discount'];
    } else if (lower.includes('review') || lower.includes('google review')) {
      toolName = 'draft_review_reply';
      intent = 'Draft AI response to latest Google review';
      requiredPermission = 'marketing:write';
      progressStep = 'Analyzing review sentiment...';
      parameters = { reviewId: 'rev-701', sentiment: 'POSITIVE' };
      responseText = `Drafted response to 5-star Google review from Aarav Desai: "Thank you Aarav! We are delighted to hear you enjoyed your hydra-facial experience with Priya."`;
      executionResult = { reviewId: 'rev-701', action: 'DRAFTED_RESPONSE' };
      suggestedPrompts = ['Approve response', 'Edit response text', 'View all reviews'];
    } else if (lower.includes('lead') || lower.includes('hottest leads') || lower.includes('pending leads')) {
      toolName = 'search_leads';
      intent = 'Retrieve top qualified sales leads';
      requiredPermission = 'customers:read';
      progressStep = 'Scanning CRM sales deal pipeline...';
      parameters = { stageFilter: ['NEW', 'CONTACTED', 'QUALIFIED'] };
      responseText = `Retrieved 5 qualified leads valued at ₹61,500. Top deal: Aishwarya Roy (Bridal package - ₹15,000).`;
      executionResult = { count: 5, totalPipelineValue: 61500 };
      suggestedPrompts = ['Assign leads to staff', 'Send automated intro SMS', 'View sales pipeline'];
    } else if (lower.includes('appointment') || lower.includes('book') || lower.includes('today\'s appointments')) {
      toolName = 'get_bookings';
      intent = 'Schedule or retrieve appointments';
      requiredPermission = 'bookings:read';
      progressStep = 'Checking staff calendar slots...';
      parameters = { status: 'CONFIRMED' };
      responseText = `You have 3 confirmed appointments scheduled today: 1) Rahul Sharma at 10:00 AM, 2) Sarah Miller at 2:00 PM, 3) Neha Gupta tomorrow at 11:00 AM.`;
      executionResult = { todayCount: 3, status: 'CONFIRMED' };
      suggestedPrompts = ['Book new appointment', 'Send SMS reminder', 'View calendar'];
    } else {
      responseText = `I analyzed your request "${prompt}". BusinessOS AI is ready to execute tools across your website, customer CRM, bookings, marketing campaigns, and invoices.`;
      suggestedPrompts = [
        'How is my business performing?',
        'Show inactive customers.',
        'Why are sales down?',
        'Create a campaign.',
        'Build my website.',
        'Show today\'s appointments.',
        'Find my hottest leads.',
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
        progressStep,
        actionRequested: {
          toolName,
          intent,
          parameters,
          requiredPermission,
          isWriteAction,
          status: 'DENIED_PERMISSIONS',
        },
        suggestedPrompts,
      };
    }

    return {
      message: responseText,
      providerUsed: this.providerName,
      progressStep,
      actionRequested: {
        toolName,
        intent,
        parameters,
        requiredPermission,
        isWriteAction,
        executionResult,
        status: isWriteAction ? 'PENDING_APPROVAL' : 'COMPLETED',
      },
      suggestedPrompts,
    };
  }
}

export class OpenAIProvider extends BaseAIProvider {
  constructor() {
    super('openai');
  }
}

export class AnthropicProvider extends BaseAIProvider {
  constructor() {
    super('anthropic');
  }
}

export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super('gemini');
  }
}

export class GroqProvider extends BaseAIProvider {
  constructor() {
    super('groq');
  }
}

export function createAIService(provider: AIProvider = 'openai'): IAIService {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'gemini':
      return new GeminiProvider();
    case 'groq':
      return new GroqProvider();
    default:
      return new BaseAIProvider('mock');
  }
}

export * from './prompts/master-system-prompt';

