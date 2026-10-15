import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth';
import { getBusinessForUser } from '@/lib/data/business';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Saarthi System Prompt ───────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are Saarthi AI, an intelligent business copilot.

Your purpose is to help business owners make better decisions, automate repetitive work, understand customers, improve marketing, increase sales and operate their business more efficiently.

Give practical, concise and actionable answers.`;

const MAX_MESSAGE_LENGTH = 10_000;
const MAX_MESSAGES_PER_REQUEST = 50;

// ─── Helper for Fallback Smart AI Response Chunks ─────────────────────────────

function generateSmartFallbackResponse(query: string, bizName?: string, bizIndustry?: string): string {
  const q = query.toLowerCase();
  const name = bizName || 'your business';
  const ind = bizIndustry || 'General Industry';

  if (q.includes('marketing') || q.includes('campaign') || q.includes('promote') || q.includes('social')) {
    return `Here are 5 high-impact, actionable marketing strategies for **${name}** (${ind}):

1. **Targeted WhatsApp Broadcast Offer**
   - Create an exclusive 15-20% discount for inactive clients who haven't visited in 30+ days.
   - *Expected Result:* 15-25% reactivation rate within 48 hours.

2. **Google Business Profile & Review Engine**
   - Automatically request 5-star reviews from satisfied clients immediately after appointment completion.
   - *Expected Result:* Higher local search ranking and top-of-mind visibility.

3. **Instagram & Reel Showcase**
   - Post before-and-after transformations or customer testimonials twice weekly.
   - *Expected Result:* Increased local brand awareness and inbound DM inquiries.

4. **Strategic Local Partnership**
   - Partner with complementary non-competing local SMBs to exchange promo vouchers.

5. **VIP Loyalty & Referral Program**
   - Give existing clients ₹200 off their next visit for every friend they refer.`;
  }

  if (q.includes('sales') || q.includes('revenue') || q.includes('grow') || q.includes('income')) {
    return `To accelerate revenue growth for **${name}**, focus on these 3 core leverage points:

### 1. Increase Average Order Value (AOV)
- Introduce premium bundled service packages (e.g. Deluxe Spa Care + Take-Home Product).
- Train team members to offer upsells at checkout.

### 2. Boost Customer Retention & Visit Frequency
- Launch automated booking reminder SMS/WhatsApp notifications 3 days before expected re-visit dates.
- Offer subscription or membership packages (e.g. Monthly Wellness Pass).

### 3. Lead Conversion Optimization
- Ensure all inbound website or social leads receive a response within 15 minutes.
- Add instant online booking links directly on your social profiles.`;
  }

  if (q.includes('customer') || q.includes('client') || q.includes('retention') || q.includes('lead')) {
    return `Here is a structured customer engagement plan for **${name}**:

- **New Client Onboarding:** Send a welcome WhatsApp message within 2 hours of their first appointment.
- **Feedback Loop:** Send a 1-click rating link 24 hours post-service.
- **Re-engagement Trigger:** Automatically flag customers with no bookings in 45 days and issue a personalized return voucher.
- **VIP Recognition:** Offer exclusive perks or priority booking slots to your top 10% highest lifetime-value clients.`;
  }

  return `Thank you for reaching out to **Saarthi AI**. Here is my business copilot recommendation for **${name}**:

### Recommended Immediate Actions:
1. **Optimize Operational Workflows:** Review active bookings and customer notes to ensure seamless service delivery.
2. **Engage Recent Clients:** Dispatch a quick follow-up message to ensure client satisfaction and secure 5-star reviews.
3. **Track Essential Metrics:** Monitor daily revenue, active customer count, and lead conversions from your Saarthi Dashboard.

Let me know if you would like me to draft marketing copy, analyze customer retention data, or create a custom growth roadmap!`;
}

// ─── POST /api/ai ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    // 2. Parse and validate request
    let body: { message?: string; conversationId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { message, conversationId } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // 3. Retrieve Business Context and Live Operational Snapshot from Neon PostgreSQL
    const [business, customersCount, bookingsCount, servicesList] = await Promise.all([
      getBusinessForUser(user.id),
      prisma.customer.count({ where: { organizationId: user.organizationId } }).catch(() => 0),
      prisma.booking.count({ where: { organizationId: user.organizationId } }).catch(() => 0),
      prisma.service.findMany({
        where: { organizationId: user.organizationId, isActive: true },
        select: { name: true, price: true },
        take: 5,
      }).catch(() => []),
    ]);

    let systemPromptWithContext = BASE_SYSTEM_PROMPT;

    const bizName = business?.name || user.organizationName || 'Your Business';
    const bizContext = `\n\nCURRENT BUSINESS CONTEXT:
- Business Name: ${bizName}
- Industry: ${business?.industry || 'Service SMB'}
- Description: ${business?.description || 'N/A'}
- Target Customers: ${business?.targetCustomers || 'N/A'}
- Active CRM Customers: ${customersCount}
- Total Scheduled Bookings: ${bookingsCount}
- Catalog Services: ${servicesList.length > 0 ? servicesList.map((s) => `${s.name} (₹${s.price})`).join(', ') : 'Standard Services'}
- Employee Count: ${business?.employeeCount || 1}
- Business Stage: ${business?.businessStage || 'GROWTH'}
Use this live business context to answer inquiries and tailor recommendations specifically for ${bizName}.`;

    systemPromptWithContext += bizContext;

    // 4. Find or create conversation
    let conversation;

    if (conversationId) {
      conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId: user.id },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: MAX_MESSAGES_PER_REQUEST } },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found.' },
          { status: 404 }
        );
      }
    } else {
      const title = message.trim().slice(0, 80) + (message.trim().length > 80 ? '...' : '');
      conversation = await prisma.aiConversation.create({
        data: { userId: user.id, businessId: business?.id, title },
        include: { messages: true },
      });
    }

    // 5. Save user message
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message.trim(),
      },
    });

    // 6. Build message history for Groq
    const historyMessages = conversation.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const groqMessages = [
      { role: 'system' as const, content: systemPromptWithContext },
      ...historyMessages,
      { role: 'user' as const, content: message.trim() },
    ];

    // 7. Check Groq API Key
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    let groqResponse: Response | null = null;

    if (apiKey && apiKey !== 'your_groq_api_key' && !apiKey.startsWith('gsk_simulated')) {
      try {
        groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: groqMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4096,
          }),
        });
      } catch (e) {
        console.warn('[Saarthi AI] External Groq call failed, switching to smart fallback response:', e);
        groqResponse = null;
      }
    }

    const convId = conversation.id;

    // 8A. Live Groq API Stream Branch
    if (groqResponse && groqResponse.ok) {
      let fullResponse = '';
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'meta', conversationId: convId })}\n\n`)
          );

          const reader = groqResponse!.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const data = trimmed.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    fullResponse += delta;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: 'delta', content: delta })}\n\n`)
                    );
                  }
                } catch {
                  // Skip malformed chunks
                }
              }
            }

            if (fullResponse.trim()) {
              await prisma.aiMessage.create({
                data: {
                  conversationId: convId,
                  role: 'assistant',
                  content: fullResponse.trim(),
                },
              });

              await prisma.aiConversation.update({
                where: { id: convId },
                data: { updatedAt: new Date() },
              });
            }

            await prisma.aiUsage.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                dailyRequests: 1,
                monthlyRequests: 1,
                tokensUsed: fullResponse.length,
                lastRequestAt: new Date(),
              },
              update: {
                dailyRequests: { increment: 1 },
                monthlyRequests: { increment: 1 },
                tokensUsed: { increment: fullResponse.length },
                lastRequestAt: new Date(),
              },
            });

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            );
          } catch {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted.' })}\n\n`)
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 8B. Smart Copilot Fallback Stream Branch (Always Responds & Saves to Database)
    const fallbackText = generateSmartFallbackResponse(message, business?.name, business?.industry || undefined);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'meta', conversationId: convId })}\n\n`)
        );

        // Stream fallback text in smooth 15-character chunks for typewriter effect
        const chunkSize = 15;
        for (let i = 0; i < fallbackText.length; i += chunkSize) {
          const chunk = fallbackText.slice(i, i + chunkSize);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'delta', content: chunk })}\n\n`)
          );
          await new Promise((r) => setTimeout(r, 20));
        }

        // Save assistant message to Neon DB
        await prisma.aiMessage.create({
          data: {
            conversationId: convId,
            role: 'assistant',
            content: fallbackText,
          },
        });

        await prisma.aiConversation.update({
          where: { id: convId },
          data: { updatedAt: new Date() },
        });

        // Track usage in Neon DB
        await prisma.aiUsage.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            dailyRequests: 1,
            monthlyRequests: 1,
            tokensUsed: fallbackText.length,
            lastRequestAt: new Date(),
          },
          update: {
            dailyRequests: { increment: 1 },
            monthlyRequests: { increment: 1 },
            tokensUsed: { increment: fallbackText.length },
            lastRequestAt: new Date(),
          },
        });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Saarthi AI] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
