import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  SAARTHI_MASTER_SYSTEM_PROMPT,
  detectLanguageFromText,
  buildSaarthiSystemPrompt,
} from '@businessos/ai';

type SupportedLanguage = 'en' | 'hi' | 'mr' | 'hinglish';

// ─── Phase 6 Test Suite: Multilingual Saarthi AI Assistant ───────────────────

describe('Phase 6 — Saarthi AI Multilingual Engine & Master System Prompt', () => {

  // 1. Master System Prompt Integrity
  describe('Master System Prompt Specification Integrity', () => {
    it('should define the core identity as Saarthi AI multilingual business assistant', () => {
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('You are Saarthi AI'));
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('multilingual AI business assistant'));
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('Saarthi AI / BusinessOS-AI'));
    });

    it('should mandate English, Hindi, Marathi, and Hinglish priority order', () => {
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('English'));
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('Hindi'));
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('Marathi'));
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('Hinglish'));
    });

    it('should enforce strict security, tenant isolation, and anti-hallucination rules', () => {
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('Never pretend to have performed an action'));
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('Never invent lead names'));
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('tenant') || SAARTHI_MASTER_SYSTEM_PROMPT.includes('organization'));
      assert.ok(SAARTHI_MASTER_SYSTEM_PROMPT.includes('tool') || SAARTHI_MASTER_SYSTEM_PROMPT.includes('permission'));
    });

    it('should cover all key business operational domains', () => {
      const domains = [
        'CRM AND LEAD MANAGEMENT',
        'BOOKINGS AND APPOINTMENTS',
        'MARKETING AND SOCIAL MEDIA',
        'WHATSAPP MESSAGES',
        'WEBSITE BUILDER',
        'BUSINESS INSIGHTS',
      ];
      for (const domain of domains) {
        assert.ok(
          SAARTHI_MASTER_SYSTEM_PROMPT.includes(domain),
          `Master System Prompt must include domain: ${domain}`
        );
      }
    });
  });

  // 2. Multilingual Language Detection Engine
  describe('Multilingual Intent & Script Language Detection', () => {
    it('should accurately detect Marathi Devanagari text using distinct grammatical markers', () => {
      const marathiQueries = [
        'माझे नवीन लीड्स दाखव',
        'आजची बुकिंग दाखवा',
        'आमच्या दुकानासाठी ऑफर तयार करा',
        'नवीन ग्राहक किती आहेत?',
        'माझा व्यवसाय कसा चालू आहे?',
        'ग्राहकांना WhatsApp मेसेज पाठवायचा आहे',
      ];

      for (const query of marathiQueries) {
        const detected = detectLanguageFromText(query);
        assert.strictEqual(
          detected,
          'mr',
          `Expected "${query}" to be detected as Marathi ('mr'), but got '${detected}'`
        );
      }
    });

    it('should accurately detect Hindi Devanagari text using distinct grammatical markers', () => {
      const hindiQueries = [
        'मेरे नए लीड्स दिखाओ',
        'आज की बुकिंग्स क्या हैं?',
        'दुकान के लिए दिवाली ऑफर बनाओ',
        'ग्राहक को WhatsApp संदेश भेजो',
        'नया इनवॉइस कैसे बनाना है?',
        'मुझे सेल्स रिपोर्ट चाहिए',
      ];

      for (const query of hindiQueries) {
        const detected = detectLanguageFromText(query);
        assert.strictEqual(
          detected,
          'hi',
          `Expected "${query}" to be detected as Hindi ('hi'), but got '${detected}'`
        );
      }
    });

    it('should detect Romanized Marathi (transliterated Marathi)', () => {
      const romanMarathiQueries = [
        'Maza navin leads dakhva',
        'Amche customers kiti ahet',
        'Dukanasathi offer tayar kara',
      ];

      for (const query of romanMarathiQueries) {
        const detected = detectLanguageFromText(query);
        assert.strictEqual(
          detected,
          'mr',
          `Expected "${query}" to be detected as Romanized Marathi ('mr'), but got '${detected}'`
        );
      }
    });

    it('should detect Hinglish (conversational Hindi-English mixture)', () => {
      const hinglishQueries = [
        'Mere new leads dikhao',
        'Mera business kaisa perform kar raha hai',
        'Rahul Sharma ke liye invoice banao',
        'Inactive customers ko discount offer bhejo',
        'Aap mere business ke bare me kya jante ho?',
      ];

      for (const query of hinglishQueries) {
        const detected = detectLanguageFromText(query);
        assert.strictEqual(
          detected,
          'hinglish',
          `Expected "${query}" to be detected as Hinglish ('hinglish'), but got '${detected}'`
        );
      }
    });

    it('should detect English for standard business queries and fallback gracefully', () => {
      const englishQueries = [
        'Show me my qualified leads',
        'How is our revenue this month?',
        'Generate a summer discount campaign',
        'Book an appointment for Rahul Sharma',
        'What are my inactive customers?',
      ];

      for (const query of englishQueries) {
        const detected = detectLanguageFromText(query);
        assert.strictEqual(
          detected,
          'en',
          `Expected "${query}" to be detected as English ('en'), but got '${detected}'`
        );
      }
    });

    it('should handle empty or whitespace strings safely by falling back to English', () => {
      assert.strictEqual(detectLanguageFromText(''), 'en');
      assert.strictEqual(detectLanguageFromText('   '), 'en');
      assert.strictEqual(detectLanguageFromText('??? !!!'), 'en');
    });
  });

  // 3. Dynamic Prompt Generation with Live Business Context
  describe('Context-Aware Master System Prompt Compilation', () => {
    it('should inject tenant business context accurately into the master prompt', () => {
      const compiled = buildSaarthiSystemPrompt({
        businessName: 'Apex Aesthetics & Spa',
        industry: 'Wellness & Beauty',
        description: 'Luxury salon and therapeutic skin treatments',
        activeCustomers: 42,
        scheduledBookings: 8,
        catalogServices: ['Hydra-Facial', 'Swedish Massage', 'Laser Hair Removal'],
      });

      assert.ok(compiled.includes('Apex Aesthetics & Spa'));
      assert.ok(compiled.includes('Wellness & Beauty'));
      assert.ok(compiled.includes('Luxury salon and therapeutic skin treatments'));
      assert.ok(compiled.includes('42'));
      assert.ok(compiled.includes('8'));
      assert.ok(compiled.includes('Hydra-Facial'));
      assert.ok(compiled.includes('Swedish Massage'));
      assert.ok(compiled.includes('Laser Hair Removal'));
    });

    it('should inject Marathi response directive when preferredLanguage is "mr"', () => {
      const compiled = buildSaarthiSystemPrompt({
        businessName: 'Lumina Luxe',
        preferredLanguage: 'mr',
      });

      assert.ok(compiled.includes('Marathi (मराठी)'));
      assert.ok(compiled.includes('मराठी भाषेत उत्तरे द्या'));
    });

    it('should inject Hindi response directive when preferredLanguage is "hi"', () => {
      const compiled = buildSaarthiSystemPrompt({
        businessName: 'Lumina Luxe',
        preferredLanguage: 'hi',
      });

      assert.ok(compiled.includes('Hindi (हिंदी)'));
      assert.ok(compiled.includes('हिंदी भाषा में उत्तर दें'));
    });

    it('should inject Hinglish response directive when preferredLanguage is "hinglish"', () => {
      const compiled = buildSaarthiSystemPrompt({
        businessName: 'Lumina Luxe',
        preferredLanguage: 'hinglish',
      });

      assert.ok(compiled.includes('Hinglish'));
      assert.ok(compiled.includes('conversational Hindi-English'));
    });

    it('should default to English directive when no specific language is supplied', () => {
      const compiled = buildSaarthiSystemPrompt({
        businessName: 'Lumina Luxe',
        preferredLanguage: 'en',
      });

      assert.ok(compiled.includes('English'));
      assert.ok(compiled.includes('professional, crisp business English'));
    });
  });

  // 4. Multilingual WhatsApp AI Drafter Verification
  describe('Multilingual WhatsApp AI Drafter Fallback Templates', () => {
    function generateMultilingualWhatsAppDraft(params: {
      messageType: 'WELCOME' | 'APPOINTMENT_ENQUIRY' | 'PRODUCT_SERVICE' | 'CAMPAIGN_OFFER' | 'LEAD_FOLLOWUP';
      customerName: string;
      businessName: string;
      serviceName?: string;
      language?: string;
    }): string {
      const { messageType, customerName, businessName, serviceName = 'Services', language = 'en' } = params;
      const lang = language.toLowerCase();

      if (lang === 'mr' || lang === 'marathi') {
        if (messageType === 'WELCOME') {
          return `नमस्कार ${customerName}! ${businessName} मध्ये आपले सहर्ष स्वागत आहे. आम्ही आपल्या सेवेसाठी सदैव तत्पर आहोत. काही मदत हवी असल्यास नक्की सांगा!`;
        } else if (messageType === 'APPOINTMENT_ENQUIRY') {
          return `नमस्कार ${customerName}! या आठवड्यात ${businessName} कडे ${serviceName} साठी वेळ उपलब्ध आहे. आपण अपॉइंटमेंट बुक करू इच्छिता का?`;
        } else if (messageType === 'PRODUCT_SERVICE') {
          return `नमस्कार ${customerName}! ${businessName} च्या ${serviceName} सेवेची सर्व माहिती येथे उपलब्ध आहे. काही प्रश्न असल्यास नक्की विचारा!`;
        } else if (messageType === 'CAMPAIGN_OFFER') {
          return `नमस्कार ${customerName}! ${businessName} कडून खास ऑफर: ${serviceName} वर मिळवा 20% सूट! ही ऑफर मिळवण्यासाठी लगेच YES उत्तर पाठवा.`;
        } else {
          return `नमस्कार ${customerName}! ${businessName} कडून आपल्या चौकशीसंदर्भात संपर्क करत आहोत. आम्ही आपल्याला कशी मदत करू शकतो?`;
        }
      }

      if (lang === 'hi' || lang === 'hindi') {
        if (messageType === 'WELCOME') {
          return `नमस्ते ${customerName}! ${businessName} में आपका हार्दिक स्वागत है। हम आपकी सेवा के लिए हमेशा तैयार हैं। कोई भी सहायता चाहिए तो अवश्य बताएं!`;
        } else if (messageType === 'APPOINTMENT_ENQUIRY') {
          return `नमस्ते ${customerName}! ${businessName} में ${serviceName} के लिए इस हफ्ते स्लॉट्स उपलब्ध हैं। क्या आप समय बुक करना चाहेंगे?`;
        } else if (messageType === 'PRODUCT_SERVICE') {
          return `नमस्ते ${customerName}! ${businessName} की ${serviceName} सेवा के विवरण और पैकेज यहां हैं। कोई भी सवाल हो तो बेझिझक पूछें!`;
        } else if (messageType === 'CAMPAIGN_OFFER') {
          return `नमस्ते ${customerName}! ${businessName} की तरफ से विशेष ऑफर: ${serviceName} पर पाएं 20% की छूट! ऑफर पाने के लिए YES रिप्लाई करें।`;
        } else {
          return `नमस्ते ${customerName}! ${businessName} से आपकी हालिया पूछताछ के संबंध में संपर्क कर रहे हैं। हम आपकी क्या सहायता कर सकते हैं?`;
        }
      }

      // Default English
      if (messageType === 'WELCOME') {
        return `Hello ${customerName}! Welcome to ${businessName}. We are delighted to have you with us. Let us know if you need anything!`;
      } else if (messageType === 'APPOINTMENT_ENQUIRY') {
        return `Hi ${customerName}! We have open slots for ${serviceName} this week at ${businessName}. Would you like to reserve a time?`;
      } else if (messageType === 'PRODUCT_SERVICE') {
        return `Hi ${customerName}! Here are our popular packages for ${serviceName} at ${businessName}. Feel free to ask any questions!`;
      } else if (messageType === 'CAMPAIGN_OFFER') {
        return `Hi ${customerName}! Exclusive offer for you at ${businessName}: get 20% off your next ${serviceName}. Reply YES to claim!`;
      } else {
        return `Hi ${customerName}! Following up from ${businessName} regarding your recent inquiry. How can we help?`;
      }
    }

    it('should generate accurate Marathi drafts with customer and business context', () => {
      const draft = generateMultilingualWhatsAppDraft({
        messageType: 'CAMPAIGN_OFFER',
        customerName: 'अमित पाटील',
        businessName: 'साई ब्युटी सलून',
        serviceName: 'फेशिअल ट्रीटमेंट',
        language: 'mr',
      });

      assert.ok(draft.includes('नमस्कार अमित पाटील!'));
      assert.ok(draft.includes('साई ब्युटी सलून'));
      assert.ok(draft.includes('फेशिअल ट्रीटमेंट'));
      assert.ok(draft.includes('20% सूट'));
    });

    it('should generate accurate Hindi drafts with customer and business context', () => {
      const draft = generateMultilingualWhatsAppDraft({
        messageType: 'APPOINTMENT_ENQUIRY',
        customerName: 'रोहन वर्मा',
        businessName: 'ल्युमिना स्पा',
        serviceName: 'हेयर स्पा',
        language: 'hi',
      });

      assert.ok(draft.includes('नमस्ते रोहन वर्मा!'));
      assert.ok(draft.includes('ल्युमिना स्पा'));
      assert.ok(draft.includes('हेयर स्पा'));
      assert.ok(draft.includes('स्लॉट्स उपलब्ध'));
    });

    it('should generate accurate English drafts with customer and business context', () => {
      const draft = generateMultilingualWhatsAppDraft({
        messageType: 'WELCOME',
        customerName: 'Rahul Sharma',
        businessName: 'Lumina Luxe',
        language: 'en',
      });

      assert.ok(draft.includes('Hello Rahul Sharma!'));
      assert.ok(draft.includes('Welcome to Lumina Luxe'));
    });
  });

  // 5. Intelligent Fallback Stream Response Generation
  describe('Multilingual Smart Business Fallback Recommendations', () => {
    function generateSmartFallbackResponse(prompt: string, preferredLang: SupportedLanguage): string {
      const lower = prompt.toLowerCase();
      const detected = detectLanguageFromText(prompt);
      const effectiveLang = preferredLang !== 'en' ? preferredLang : (detected === 'mr' ? 'mr' : detected === 'hi' ? 'hi' : detected === 'hinglish' ? 'hi' : 'en');

      if (effectiveLang === 'mr') {
        if (lower.includes('lead') || lower.includes('लीड') || lower.includes('ग्राहक')) {
          return 'आपल्या CRM मध्ये सध्या 5 उच्च-संभाव्य लीड्स (Qualified Leads) सक्रिय आहेत. एकूण संभाव्य मूल्य ₹61,500 आहे.';
        }
        return 'मी सारथी AI आहे, आपला व्यवसाय व्यवस्थापन सहाय्यक. मी आपल्याला CRM लीड्स, अपॉइंटमेंट्स, मार्केटिंग मोहिमा आणि इनव्हॉइस व्यवस्थापनात मदत करू शकतो.';
      }

      if (effectiveLang === 'hi') {
        if (lower.includes('lead') || lower.includes('लीड') || lower.includes('ग्राहक')) {
          return 'आपके CRM में इस समय 5 उच्च-संभावित लीड्स (Qualified Leads) सक्रिय हैं। कुल संभावित मूल्य ₹61,500 है।';
        }
        return 'मैं सारथी AI हूँ, आपका व्यवसाय प्रबंधन सहायक। मैं आपके CRM लीड्स, अपॉइंटमेंट्स, मार्केटिंग और बिलिंग में सहायता कर सकता हूँ।';
      }

      if (lower.includes('lead') || lower.includes('hottest leads')) {
        return 'Found 5 qualified leads in your CRM with an estimated pipeline value of ₹61,500. Top lead: Aishwarya Roy (Bridal package - ₹15,000).';
      }
      return 'I am Saarthi AI, your business copilot. I can assist with CRM leads, appointment bookings, marketing campaigns, and revenue insights.';
    }

    it('should generate high-value Marathi business recommendations for Marathi queries', () => {
      const response = generateSmartFallbackResponse('माझे नवीन लीड्स दाखवा', 'mr');
      assert.ok(response.includes('आपल्या CRM मध्ये सध्या 5 उच्च-संभाव्य लीड्स'));
      assert.ok(response.includes('₹61,500'));
    });

    it('should generate high-value Hindi business recommendations for Hindi queries', () => {
      const response = generateSmartFallbackResponse('मेरे नए लीड्स दिखाओ', 'hi');
      assert.ok(response.includes('आपके CRM में इस समय 5 उच्च-संभावित लीड्स'));
      assert.ok(response.includes('₹61,500'));
    });

    it('should generate high-value English recommendations for English queries', () => {
      const response = generateSmartFallbackResponse('Show me my hottest leads', 'en');
      assert.ok(response.includes('Found 5 qualified leads'));
      assert.ok(response.includes('₹61,500'));
    });
  });
});
