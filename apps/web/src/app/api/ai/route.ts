import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth';
import { getBusinessForUser } from '@/lib/data/business';
import { buildSaarthiSystemPrompt, detectLanguageFromText, SAARTHI_MASTER_SYSTEM_PROMPT } from '@businessos/ai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_MESSAGE_LENGTH = 10_000;
const MAX_MESSAGES_PER_REQUEST = 50;

// ─── Multilingual Smart Fallback AI Response Generator ───────────────────────

function generateSmartFallbackResponse(
  query: string,
  bizName?: string,
  bizIndustry?: string,
  preferredLang?: string
): string {
  const name = bizName || 'your business';
  const ind = bizIndustry || 'General Industry';

  // Language Detection & Selection according to Master Prompt priority
  const detectedLang = detectLanguageFromText(query);
  const lang =
    preferredLang && preferredLang !== 'en' && detectedLang === 'en' && !/^[a-zA-Z0-9\s.,?!'"-:;]*$/.test(query)
      ? preferredLang
      : detectedLang;

  const lower = query.toLowerCase();

  // 1. MARATHI (मराठी)
  if (lang === 'mr') {
    if (query.includes('लीड') || lower.includes('lead') || query.includes('ग्राहक') || query.includes('दाखव') || query.includes('नवीन')) {
      return `नमस्कार! **${name}** व्यवसायासाठी ग्राहक व नवीन लीड्स व्यवस्थापन सल्ला:

1. **नवीन लीड्सचे तात्काळ व्यवस्थापन (Instant WhatsApp Follow-up)**
   - चौकशी आलेल्या नवीन ग्राहकांना १५ मिनिटांच्या आत WhatsApp द्वारे स्वागत संदेश व सेवा माहिती पाठवा.
   - *अपेक्षित निकाल:* लीड्सचे प्रत्यक्ष ग्राहकांमध्ये रूपांतर होण्याचा दर २५-३०% वाढेल.

2. **डॉर्मंट/निष्क्रिय ग्राहकांचे पुनरागमन (Client Reactivation)**
   - मागील ३० दिवसांत न आलेल्या ग्राहकांसाठी १०-२०% सवलत ऑफर तयार करा.

3. **नियमित बुकिंग स्मरणपत्रे (Appointment Reminders)**
   - ग्राहकांना भेटीच्या आदल्या दिवशी स्वयंचलित रिमाइंडर पाठवा, ज्यामुळे नो-शो कमी होतात.`;
    }

    if (
      query.includes('मार्केटिंग') ||
      lower.includes('marketing') ||
      query.includes('जाहिरात') ||
      query.includes('पोस्ट') ||
      query.includes('मेसेज') ||
      query.includes('तयार कर')
    ) {
      return `**${name}** साठी प्रभावशाली मराठी मार्केटिंग व जाहिरात योजना:

✨ **सोशल मीडिया व WhatsApp पोस्ट ड्राफ्ट:**
"नमस्कार! **${name}** मध्ये आपल्या सेवेसाठी आम्ही सज्ज आहोत. आमच्या विशेष सेवांचा लाभ घ्या आणि मिळवा मनसोक्त अनुभव. आजच आपली वेळ आरक्षित करा! 🌿
👉 अधिक माहितीसाठी किंवा बुकिंगसाठी WhatsApp वर संपर्क साधा."

### मुख्य मार्केटिंग कृती:
1. **स्थानिक WhatsApp ब्रॉडकास्ट**: सणासुदीच्या व वीकेंडच्या खास ऑफर्स पाठवा.
2. **Google बिझनेस ५-स्टार रिव्ह्यू**: समाधानी ग्राहकांकडून प्रत्यक्ष रिव्ह्यू मिळवा.
3. **VIP रेफरल कार्यक्रम**: मित्रांची शिफारस करणाऱ्या ग्राहकांना विशेष व्हाऊचर द्या.`;
    }

    return `नमस्कार! मी **Saarthi AI** आहे, आपला व्यवसाय सहाय्यक. **${name}** (${ind}) साठी शिफारसी:

1. **दैनिक ऑपरेशन्स ट्रॅक करा:** CRM मधील नवीन लीड्स व आगामी बुकिंग्ज तपासा.
2. **ग्राहकांशी संवाद सुधारा:** सेवा पूर्ण झाल्यावर ग्राहकांकडून ५-स्टार रिव्ह्यू मिळवण्यासाठी WhatsApp मेसेज पाठवा.
3. **मार्केटिंग मोहीम राबवा:** निष्क्रिय ग्राहकांना आकर्षित करण्यासाठी नवीन विशेष पॅकेजेस ऑफर करा.

आपल्याला मार्केटिंग पोस्ट, ग्राहक संवाद किंवा व्यवसाय वाढीसाठी काही मदत हवी असल्यास नक्की सांगा!`;
  }

  // 2. HINDI (हिंदी)
  if (lang === 'hi') {
    if (query.includes('लीड') || lower.includes('lead') || query.includes('ग्राहक') || query.includes('दिखाओ')) {
      return `नमस्ते! **${name}** के लिए CRM और लीड्स प्रबंधन रणनीतियाँ:

1. **त्वरित WhatsApp फॉलो-अप (Instant Response)**
   - नई इनबाउंड लीड्स को १५ मिनट के भीतर प्री-फिल्ड WhatsApp मेसेज से संपर्क करें।
   - *अपेक्षित परिणाम:* लीड कन्वर्जन रेट में २५% तक की वृद्धि।

2. **निष्क्रिय ग्राहकों को री-एंगेज करें**
   - पिछले ३०+ दिनों से न आए ग्राहकों को १५-२०% की विशेष छूट का ब्रॉडकास्ट भेजें।

3. **फीडबैक और रिव्यूज का संग्रह**
   - सेवा पूरी होने के २४ घंटे के भीतर ग्राहकों से Google पर ५-स्टार रेटिंग का अनुरोध करें।`;
    }

    if (
      query.includes('मार्केटिंग') ||
      lower.includes('marketing') ||
      query.includes('पोस्ट') ||
      query.includes('अभियान') ||
      query.includes('मेसेज') ||
      query.includes('बनाओ') ||
      query.includes('बना')
    ) {
      return `**${name}** के लिए हाई-कन्वर्जन हिंदी मार्केटिंग पोस्ट:

✨ **सोशल मीडिया व WhatsApp पोस्ट कॉपी:**
"नमस्ते! **${name}** में आपका स्वागत है। क्या आप बेहतरीन सर्विस और रिलैक्सेशन की तलाश में हैं? आज ही अपनी अपॉइंटमेंट बुक करें और हमारी प्रीमियम सेवाओं का आनंद लें! 🌸
👉 अधिक जानकारी और तुरंत बुकिंग के लिए हमें WhatsApp करें।"

### मुख्य रणनीतियाँ:
1. **वीकेंड फ्लैश ऑफर्स**: वीकेंड पर आने वाले ग्राहकों के लिए स्पेशल बंडल पैकेज।
2. **Google Business Profile**: लोकल सर्च में टॉप पर आने के लिए रिव्यूज एकत्र करें।
3. **कस्टमर लॉयल्टी रिवार्ड्स**: नियमित ग्राहकों को विशेष पॉइंट्स या डिस्काउंट दें।`;
    }

    return `नमस्ते! मैं **Saarthi AI** हूँ, आपका बिज़नेस कोपायलट। **${name}** (${ind}) के लिए मेरे मुख्य सुझाव:

1. **दैनिक संचालन को व्यवस्थित करें:** आज की अपॉइंटमेंट्स और पेंडिंग इनवॉइस की समीक्षा करें।
2. **लीड्स को प्राथमिकता दें:** नई पूछताछ करने वाले ग्राहकों को तुरंत फॉलो-अप मेसेज भेजें।
3. **रेवेन्यू ग्रोथ पर ध्यान दें:** अपनी सबसे लोकप्रिय सेवाओं के साथ एड-ऑन सेवाएं ऑफर करें।

बताएं कि मैं आपके लिए मार्केटिंग कॉपी ड्राफ्ट करूँ, कस्टमर मैसेज तैयार करूँ या सेल्स प्लान बनाऊँ?`;
  }

  // 3. HINGLISH
  if (lang === 'hinglish') {
    if (lower.includes('lead') || lower.includes('customer') || lower.includes('dikhao') || lower.includes('chahiye')) {
      return `Bilkul! Main **Saarthi AI** hoon, aapka business copilot. **${name}** ke CRM aur leads ke liye yeh rahe key actionable steps:

1. **Instant WhatsApp Follow-Up (Within 15 Mins)**
   - New inbound leads ko Saarthi WhatsApp draft feature se direct contact karein.
   - *Expected Result:* Conversion rate 25-30% tak boost hoga.

2. **Re-engage Inactive Clients (30+ Days)**
   - Jo clients pichhle 30 din se nahi aaye hain, unhe exclusive 15-20% off ka broadcast bhejein.

3. **Automated Feedback & Google Reviews**
   - Service complete hote hi 1-click 5-star review request send karein.`;
    }

    if (lower.includes('marketing') || lower.includes('campaign') || lower.includes('post') || lower.includes('banao') || lower.includes('bana')) {
      return `**${name}** ke liye high-converting social media & WhatsApp campaign draft:

✨ **Ready-to-use Post Copy:**
"Hey there! Treat yourself to the luxury you deserve at **${name}**. Book your session this week and enjoy exclusive promotional offers! ✨
👉 DM us or click our WhatsApp link to reserve your slot now!"

### 3 Growth Hacks:
1. **Targeted WhatsApp Broadcast:** Inactive clients ko personalized offer send karein.
2. **Local Google Business Boost:** Verified customer reviews se local rank improve karein.
3. **VIP Referral Program:** Friends refer karne par ₹200 off voucher provide karein.`;
    }

    return `Hello! Main **Saarthi AI** hoon, aapka multilingual business copilot. **${name}** (${ind}) ke liye key immediate actions:

1. **Operational Pulse Check:** Aaj ke scheduled appointments aur pending tasks verify karein.
2. **Customer Re-engagement:** Recent clients ko follow-up WhatsApp message bhejkar satisfaction confirm karein.
3. **Track Revenue Metrics:** Saarthi dashboard par daily sales, booking rates aur customer LTV monitor karein.

Aap mujhse koi bhi marketing post, customer reply ya business strategy generate karne ke liye bol sakte hain!`;
  }

  // 4. ENGLISH DEFAULT
  if (lower.includes('marketing') || lower.includes('campaign') || lower.includes('promote') || lower.includes('social')) {
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

  if (lower.includes('sales') || lower.includes('revenue') || lower.includes('grow') || lower.includes('income')) {
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

  if (lower.includes('customer') || lower.includes('client') || lower.includes('retention') || lower.includes('lead')) {
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
    let body: { message?: string; conversationId?: string; preferredLanguage?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { message, conversationId, preferredLanguage } = body;

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

    const bizName = business?.name || user.organizationName || 'Your Business';

    const systemPromptWithContext = buildSaarthiSystemPrompt({
      businessName: bizName,
      industry: business?.industry || 'Service SMB',
      description: business?.description || 'N/A',
      customersCount,
      bookingsCount,
      servicesList,
      preferredLanguage: preferredLanguage || 'en',
    });

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
    const fallbackText = generateSmartFallbackResponse(
      message,
      business?.name,
      business?.industry || undefined,
      preferredLanguage
    );

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
