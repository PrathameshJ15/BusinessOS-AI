'use client';

import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { AICommand } from '../components/landing/AICommand';
import { BusinessEcosystem } from '../components/landing/BusinessEcosystem';
import { WorkflowSection } from '../components/landing/WorkflowSection';
import { ProductPreview } from '../components/landing/ProductPreview';
import { IndustrySelector } from '../components/landing/IndustrySelector';
import { IntelligenceSection } from '../components/landing/IntelligenceSection';
import { Features } from '../components/landing/Features';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/landing/Footer';

export default function SaarthiLandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <Hero />
      <AICommand />
      <BusinessEcosystem />
      <WorkflowSection />
      <ProductPreview />
      <IndustrySelector />
      <IntelligenceSection />
      <Features />
      <FinalCTA />
      <Footer />
    </main>
  );
}
