import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── POST /api/ai/whatsapp-draft ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const activeEmailHeader = request.headers.get('x-saarthi-user-email');
    const cookieEmail = request.cookies.get('saarthi_user_email')?.value;
    const user = await getServerUser(activeEmailHeader || cookieEmail || undefined);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const {
      messageType = 'LEAD_FOLLOWUP',
      customerName = 'valued customer',
      businessName: clientBizName,
      serviceName = 'our premium services',
      offerDetails = 'exclusive 20% discount',
      language = 'en',
      preferredLanguage,
    } = body;

    const targetLang = preferredLanguage || language || 'en';

    // Fetch tenant business name for context
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: { profile: true },
    });

    const businessName = clientBizName || org?.name || 'our business';

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    let draft = '';

    if (apiKey) {
      try {
        const langDirective =
          targetLang === 'mr'
            ? 'Write this message in natural, polite Marathi (मराठी).'
            : targetLang === 'hi'
            ? 'Write this message in natural, polite Hindi (हिंदी).'
            : 'Write this message in English (or Hinglish if appropriate).';

        const groqPrompt = `Write a single, polite, natural, and high-converting WhatsApp message (under 250 characters).
Context:
- Business: ${businessName}
- Recipient: ${customerName}
- Message Purpose: ${messageType}
- Service / Offering: ${serviceName}
- Offer Details: ${offerDetails}
- Language: ${langDirective}

Guidelines:
- Warm, polite Indian business tone.
- 1 or 2 relevant emojis max.
- Do NOT use bracketed placeholders like [Name] or [Business].
- Output ONLY the final message text, nothing else.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are Saarthi AI, an expert multilingual WhatsApp business copywriter for modern service enterprises and SMBs.',
              },
              { role: 'user', content: groqPrompt },
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });

        if (groqRes.ok) {
          const json = await groqRes.json();
          draft = json.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (err) {
        console.warn('[POST /api/ai/whatsapp-draft] External Groq call failed, using fallback:', err);
      }
    }

    // Deterministic fallback if Groq call failed or unconfigured
    if (!draft) {
      if (targetLang === 'mr') {
        switch (messageType) {
          case 'WELCOME':
            draft = `नमस्कार ${customerName}! ${businessName} मध्ये आपले सहर्ष स्वागत आहे. अधिक माहिती व बुकिंगसाठी आम्हाला नक्की संपर्क करा! ✨`;
            break;
          case 'APPOINTMENT_ENQUIRY':
            draft = `नमस्कार ${customerName}! या आठवड्यात ${businessName} येथे ${serviceName} साठी वेळेच्या जागा उपलब्ध आहेत. वेळ आरक्षित करायची आहे का? 📅`;
            break;
          case 'PRODUCT_SERVICE':
            draft = `नमस्कार ${customerName}! ${businessName} मधील ${serviceName} सेवेचा संपूर्ण दरपत्रक जाणून घेण्यासाठी आम्हाला येथे रिप्लाय करा! 🌿`;
            break;
          case 'CAMPAIGN_OFFER':
            draft = `नमस्कार ${customerName}! ${businessName} कडून आपल्यासाठी खास सवलत: ${offerDetails}. आजच लाभ घेण्यासाठी उत्तर द्या! 🎉`;
            break;
          case 'LEAD_FOLLOWUP':
          default:
            draft = `नमस्कार ${customerName}! ${businessName} कडून संपर्क करत आहोत. आपल्या चौकशीबद्दल चर्चा करण्यासाठी आम्ही उपलब्ध आहोत. 🌿`;
            break;
        }
      } else if (targetLang === 'hi') {
        switch (messageType) {
          case 'WELCOME':
            draft = `नमस्ते ${customerName}! ${businessName} में आपका हार्दिक स्वागत है। किसी भी सेवा या अपॉइंटमेंट के लिए हमें रिप्लाई करें! ✨`;
            break;
          case 'APPOINTMENT_ENQUIRY':
            draft = `नमस्ते ${customerName}! ${businessName} में इस सप्ताह ${serviceName} के लिए स्लॉट्स उपलब्ध हैं। क्या आप बुकिंग कन्फर्म करना चाहते हैं? 📅`;
            break;
          case 'PRODUCT_SERVICE':
            draft = `नमस्ते ${customerName}! ${businessName} की लोकप्रिय ${serviceName} सेवाओं की पूरी सूची जानने के लिए रिप्लाई करें! 🌿`;
            break;
          case 'CAMPAIGN_OFFER':
            draft = `नमस्ते ${customerName}! ${businessName} की ओर से विशेष ऑफर: ${offerDetails}. इसका लाभ उठाने के लिए अभी रिप्लाई करें! 🎉`;
            break;
          case 'LEAD_FOLLOWUP':
          default:
            draft = `नमस्ते ${customerName}! ${businessName} की ओर से संपर्क कर रहे हैं। आपकी पूछताछ के संबंध में हम आपकी कैसे सहायता कर सकते हैं? 🌸`;
            break;
        }
      } else {
        switch (messageType) {
          case 'WELCOME':
            draft = `Hello ${customerName}! Welcome to ${businessName}. We are delighted to have you with us. Feel free to reply anytime for bookings or inquiries! ✨`;
            break;
          case 'APPOINTMENT_ENQUIRY':
            draft = `Hi ${customerName}! We have open slots for ${serviceName} this week at ${businessName}. Would you like to reserve a convenient time slot? 📅`;
            break;
          case 'PRODUCT_SERVICE':
            draft = `Hi ${customerName}! Here are details on our popular packages for ${serviceName} at ${businessName}. Reply to get our complete pricing menu! 🌿`;
            break;
          case 'CAMPAIGN_OFFER':
            draft = `Hi ${customerName}! Special offer from ${businessName}: Enjoy ${offerDetails} on your next visit. Valid this week only—reply YES to claim! 🎉`;
            break;
          case 'LEAD_FOLLOWUP':
          default:
            draft = `Hi ${customerName}! Thank you for reaching out to ${businessName}. We would love to assist you with ${serviceName}. When would be a good time to connect?`;
            break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      draft,
      messageType,
      businessName,
    });
  } catch (error: any) {
    console.error('[POST /api/ai/whatsapp-draft] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate WhatsApp message draft.' },
      { status: 500 }
    );
  }
}
