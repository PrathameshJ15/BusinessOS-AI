'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Services } from '@/components/landing/Services';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ProductPreview } from '@/components/landing/ProductPreview';
import { Metrics } from '@/components/landing/Metrics';
import { CaseStudies } from '@/components/landing/CaseStudies';
import { Testimonials } from '@/components/landing/Testimonials';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { GridBackground } from '@/components/landing/GridBackground';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 overflow-x-hidden relative transition-colors duration-300 selection:bg-emerald-600 selection:text-white">
      <GridBackground />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Services />
        <HowItWorks />
        <ProductPreview />
        <Metrics />
        <CaseStudies />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </div>
    </main>
  );
}
