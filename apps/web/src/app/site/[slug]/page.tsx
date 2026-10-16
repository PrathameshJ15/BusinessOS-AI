'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Calendar,
  Send,
  Loader2,
  AlertCircle,
  Scissors,
  Heart,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { buildWhatsAppClickToChat } from '@/lib/whatsapp';

interface SiteData {
  id: string;
  subdomain: string;
  domainName: string;
  isPublished: boolean;
  themeColor: string;
  fontFamily: string;
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  blocks: any[];
  services: any[];
  whatsappSettings?: {
    phoneNumber: string;
    ctaLabel: string;
    visitorMessage: string;
  } | null;
}

const DEFAULT_MOCK_SITE: SiteData = {
  id: 'mock-lumina-luxe',
  subdomain: 'lumina-luxe',
  domainName: 'lumina-luxe.businessos.in',
  isPublished: true,
  themeColor: '#059669',
  fontFamily: 'Plus Jakarta Sans',
  businessName: 'Lumina Luxe Salon & Aesthetics',
  tagline: 'Hyderabad’s Premier Sanctuary for Wellness, Aesthetics & Hair Artistry',
  phone: '+91 98200 12345',
  email: 'concierge@luminaluxe.in',
  address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
  blocks: [
    {
      id: 'blk-1',
      type: 'HERO',
      title: 'Experience Pure Radiance & Bespoke Luxury',
      content: {
        heading: 'Experience Pure Radiance & Bespoke Luxury',
        subheading: 'Hyderabad’s premier destination for advanced clinical skincare, precision hair styling, and holistic spa wellness.',
        ctaText: 'Reserve Your Visit',
        ctaLink: '#book',
      },
    },
    {
      id: 'blk-2',
      type: 'SERVICES',
      title: 'Signature Aesthetic & Wellness Treatments',
      content: {
        heading: 'Signature Aesthetic & Wellness Treatments',
        subheading: 'Crafted by world-class aestheticians using clinical-grade organic formulations.',
        ctaText: 'Explore Full Menu',
      },
    },
    {
      id: 'blk-3',
      type: 'FEATURES',
      title: 'Why Discerning Clients Choose Lumina Luxe',
      content: {
        heading: 'Why Discerning Clients Choose Lumina Luxe',
        subheading: 'US-FDA approved laser aesthetic tech, private VIP therapy suites, and 100% cruelty-free botanical serums.',
      },
    },
    {
      id: 'blk-4',
      type: 'TESTIMONIALS',
      title: 'Over 120+ 5-Star Verified Google Reviews',
      content: {
        heading: 'Over 120+ 5-Star Verified Google Reviews',
        subheading: 'Rated 4.9★ by our valued clientele for exceptional hygiene, personalized consultation, and stellar results.',
      },
    },
    {
      id: 'blk-5',
      type: 'CONTACT',
      title: 'Visit Our Sanctuary in Jubilee Hills',
      content: {
        heading: 'Visit Our Sanctuary in Jubilee Hills',
        subheading: 'Road No. 36, Jubilee Hills, Hyderabad · Open 7 Days a Week: 10:00 AM – 9:00 PM · Complimentary Valet Parking.',
        ctaText: 'Get Directions on Maps',
      },
    },
  ],
  services: [
    { id: 'srv-1', name: 'Ayurvedic Botanical Radiance Facial', description: 'Deep botanical cleansing, custom herbal exfoliation, and lymphatic drainage.', price: '₹2,499', durationMinutes: 60 },
    { id: 'srv-2', name: 'Keratin Smoothing & Protein Therapy', description: 'Formaldehyde-free intensive hair restructuring with intense silk shine.', price: '₹4,999', durationMinutes: 90 },
    { id: 'srv-3', name: 'Aromatherapy Stress-Relief Massage', description: 'Pure cold-pressed essential oils with Swedish deep pressure techniques.', price: '₹3,299', durationMinutes: 75 },
    { id: 'srv-4', name: 'Hydra-Facial Ultra Glow Treatment', description: 'Non-invasive vortex suction for pore extraction and peptide antioxidant hydration.', price: '₹3,999', durationMinutes: 60 },
    { id: 'srv-5', name: 'Bridal HD Precision Makeup & Hair', description: 'High-definition bridal styling with waterproof airbrush base and accessories setting.', price: '₹14,999', durationMinutes: 180 },
    { id: 'srv-6', name: 'Clinical Laser Hair Reduction', description: 'Triple-wavelength pain-free diode aesthetic session for silky smooth skin.', price: '₹2,999', durationMinutes: 45 },
  ],
  whatsappSettings: {
    phoneNumber: '+919820012345',
    ctaLabel: 'Chat with Concierge',
    visitorMessage: 'Hi Lumina Luxe team, I saw your website and would like to book a consultation!',
  },
};

export default function PublicWebsitePage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'lumina-luxe';

  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSite() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/site/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const sitePayload = data?.site || data;
          setSite(sitePayload);
        } else {
          // Fallback to rich default mock site
          setSite(DEFAULT_MOCK_SITE);
        }
      } catch (err: any) {
        // Fallback to rich default mock site on error
        setSite(DEFAULT_MOCK_SITE);
      } finally {
        setLoading(false);
      }
    }
    fetchSite();
  }, [slug]);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/site/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          notes: selectedService ? `Interested in ${selectedService}. ${message}` : message,
          estimatedValue: 2500,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to submit inquiry.');
      }

      setSubmitSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading website...</p>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-display">Website Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md">
          {error || 'This website is not currently published or available on this domain.'}
        </p>
      </div>
    );
  }

  const blocks = (site?.blocks && Array.isArray(site.blocks)) ? site.blocks : (DEFAULT_MOCK_SITE.blocks || []);
  const heroBlock = blocks.find((b: any) => b.type === 'HERO');
  const servicesBlock = blocks.find((b: any) => b.type === 'SERVICES');
  const testimonialsBlock = blocks.find((b: any) => b.type === 'TESTIMONIALS');
  const contactBlock = blocks.find((b: any) => b.type === 'CONTACT');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              {site.businessName}
            </span>
            <p className="text-[11px] text-slate-400 font-medium">{site.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${site.phone}`}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{site.phone}</span>
            </a>
            {site.whatsappSettings && (
              <a
                href={buildWhatsAppClickToChat(site.whatsappSettings.phoneNumber, site.whatsappSettings.visitorMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventType: 'WHATSAPP_CLICK', referrerHost: typeof window !== 'undefined' ? window.location.hostname : '' }),
                  }).catch(() => {});
                }}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{site.whatsappSettings.ctaLabel || 'Chat on WhatsApp'}</span>
              </a>
            )}
            <a
              href="#book"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Book Appointment
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-slate-950 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to {site.businessName}</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            {heroBlock?.content?.heading || heroBlock?.title || 'Experience Bespoke Care & Excellence'}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {heroBlock?.content?.subheading || heroBlock?.subtitle || 'Premier salon, spa, and aesthetics therapies designed for revitalization.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#book"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{heroBlock?.content?.ctaText || 'Reserve Your Visit'}</span>
            </a>
            {site.whatsappSettings && (
              <a
                href={buildWhatsAppClickToChat(site.whatsappSettings.phoneNumber, site.whatsappSettings.visitorMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventType: 'WHATSAPP_CLICK', referrerHost: typeof window !== 'undefined' ? window.location.hostname : '' }),
                  }).catch(() => {});
                }}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>{site.whatsappSettings.ctaLabel || 'Chat on WhatsApp'}</span>
              </a>
            )}
            <a
              href="#services"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* Services Catalog Section */}
      <section id="services" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Our Offerings</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            {servicesBlock?.content?.heading || 'Signature Treatments & Packages'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            {servicesBlock?.content?.subheading || 'Each treatment is personalized by our experienced specialists.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(servicesBlock?.content?.items || site.services || []).map((srv: any, idx: number) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{srv.name}</h3>
                <p className="text-xs text-slate-400">
                  {srv.description || 'Clinical-grade formulations delivering visible relaxation and radiance.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 font-display text-base">
                  {srv.price ? (String(srv.price).startsWith('₹') ? srv.price : `₹${srv.price}`) : '₹1,499'}
                </span>
                <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  {srv.time || `${srv.durationMinutes || 60} mins`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Client Feedback</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              {testimonialsBlock?.content?.heading || 'Loved by Our Guests'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(testimonialsBlock?.content?.reviews || [
              { author: 'Meera K.', text: 'The attention to detail and atmosphere is unmatched. Highly recommended!', rating: 5 },
              { author: 'Arjun N.', text: 'Outstanding precision styling and seamless appointment scheduling.', rating: 5 },
            ]).map((rev: any, idx: number) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic">"{rev.text}"</p>
                <span className="text-xs font-bold text-white block">— {rev.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Booking & Lead Capture Section */}
      <section id="book" className="py-20 px-6 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Direct Inquiries</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            {contactBlock?.content?.heading || 'Schedule Your Appointment'}
          </h2>
          <p className="text-xs text-slate-400">
            Submit your contact details and our team will confirm your preferred slot within minutes.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          {submitSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Inquiry Received!</h3>
              <p className="text-xs text-slate-300">
                Thank you, {name}! Your inquiry has been forwarded directly to {site.businessName}. We will be in touch shortly.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitLead} className="space-y-4 text-xs">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number (+91) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 11223"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Preferred Treatment / Service</label>
                  <input
                    type="text"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    placeholder="e.g. Hydra-Facial or Hair Styling"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Message or Specific Requests</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify preferred timing, staff preferences, or questions..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSubmitting ? 'Submitting Inquiry...' : 'Confirm Appointment Request'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{site.businessName}</span>
            <span>·</span>
            <span>{site.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-bold text-emerald-400">Saarthi AI</span>
            <span>(BusinessOS)</span>
          </div>
        </div>
      </footer>
      {/* Floating WhatsApp Action */}
      {site.whatsappSettings && (
        <aside aria-label="WhatsApp Contact" className="fixed bottom-6 right-6 z-50">
          <a
            href={buildWhatsAppClickToChat(site.whatsappSettings.phoneNumber, site.whatsappSettings.visitorMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType: 'WHATSAPP_CLICK', referrerHost: typeof window !== 'undefined' ? window.location.hostname : '' }),
              }).catch(() => {});
            }}
            className="px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span className="hidden sm:inline">{site.whatsappSettings.ctaLabel || 'Chat on WhatsApp'}</span>
          </a>
        </aside>
      )}
    </div>
  );
}
