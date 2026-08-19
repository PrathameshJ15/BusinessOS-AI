'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { BackgroundCameraController } from './BackgroundCameraController';
import { CentralAICore } from './CentralAICore';
import { BusinessNodesNetwork } from './BusinessNodesNetwork';
import { FlowingBezierStreams } from './FlowingBezierStreams';
import { FloatingGlassStructures } from './FloatingGlassStructures';
import { AtmosphericParticles } from './AtmosphericParticles';

export const Saarthi3DBackground: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollProgressRef = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      // Reduced motion media query
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(motionQuery.matches);
      const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      motionQuery.addEventListener('change', handleMotionChange);

      // Mobile check
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 1);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);

      // Scroll listener
      const handleScroll = () => {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScroll > 0) {
          scrollProgressRef.current = Math.min(1, Math.max(0, window.scrollY / totalScroll));
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();

      return () => {
        motionQuery.removeEventListener('change', handleMotionChange);
        window.removeEventListener('resize', checkMobile);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="fixed inset-0 z-0 bg-slate-950 pointer-events-none" />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      <Canvas
        camera={{ position: [0, 0, isMobile ? 8.5 : 7.2], fov: 46 }}
        gl={{
          antialias: !isMobile,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        className="w-full h-full"
      >
        {/* Restrained Ambient & Directional Lighting Palette */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 12, 8]} intensity={1.0} color="#F8FAFC" />
        <directionalLight position={[-10, -8, -5]} intensity={0.4} color="#3B82F6" />

        <Suspense fallback={null}>
          <BackgroundCameraController
            reducedMotion={reducedMotion}
            scrollProgressRef={scrollProgressRef}
            isMobile={isMobile}
          />
          <AtmosphericParticles reducedMotion={reducedMotion} isMobile={isMobile} />
          <CentralAICore reducedMotion={reducedMotion} isMobile={isMobile} />
          <BusinessNodesNetwork reducedMotion={reducedMotion} isMobile={isMobile} />
          <FlowingBezierStreams reducedMotion={reducedMotion} isMobile={isMobile} />
          <FloatingGlassStructures reducedMotion={reducedMotion} isMobile={isMobile} />
        </Suspense>
      </Canvas>

      {/* Deep Atmospheric Vignette & Soft Gradient Mask for Unmatched Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#020617_95%)] pointer-events-none" />
    </div>
  );
};
