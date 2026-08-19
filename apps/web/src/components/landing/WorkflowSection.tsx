'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MessageSquare, BrainCircuit, Zap, CheckCircle2, ArrowRight, Bot, Sparkles } from 'lucide-react';

interface StageCoreProps {
  scrollStage: 1 | 2 | 3;
}

const TransformingSaarthiCore: React.FC<StageCoreProps> = ({ scrollStage }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  const stageColors = {
    1: '#3B82F6', // Blue for ASK
    2: '#8B5CF6', // Violet for UNDERSTAND
    3: '#10B981', // Green for ACT
  };

  const currentColor = stageColors[scrollStage];

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (0.3 * scrollStage);
      meshRef.current.rotation.x += delta * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial color={currentColor} wireframe transparent opacity={0.6} />
      </mesh>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color={currentColor}
          roughness={0.2}
          metalness={0.8}
          emissive={currentColor}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

export const WorkflowSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const [scrollStage, setScrollStage] = useState<1 | 2 | 3>(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
    }

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalHeight = rect.height - windowHeight;
      if (totalHeight <= 0) return;

      const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (rect.height + windowHeight)));

      if (progress < 0.35) {
        setScrollStage(1);
      } else if (progress < 0.7) {
        setScrollStage(2);
      } else {
        setScrollStage(3);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="py-24 px-6 bg-slate-900/60 backdrop-blur-sm text-white border-t border-slate-800/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Headline & Marathi Micro-Tag */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CORE PRODUCT PHILOSOPHY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            Ask. Saarthi understands. Saarthi acts.
          </h2>

          {/* Marathi Editorial Micro-Tag */}
          <p className="text-xs sm:text-sm font-devanagari text-blue-400 font-semibold">
            विचारा. सारथी काम करेल.
          </p>

          <p className="text-xs sm:text-sm text-slate-400">
            Saarthi does not merely answer questions — it turns intent into action.
          </p>
        </div>

        {/* Stage Progress Bar Selector */}
        <div className="flex items-center justify-center gap-3 max-w-xl mx-auto">
          {[
            { stage: 1, label: '01 — ASK', color: '#3B82F6' },
            { stage: 2, label: '02 — UNDERSTAND', color: '#8B5CF6' },
            { stage: 3, label: '03 — ACT', color: '#10B981' },
          ].map((item) => {
            const isActive = scrollStage === item.stage;
            return (
              <button
                key={item.stage}
                onClick={() => setScrollStage(item.stage as any)}
                className={`flex-1 py-2.5 px-3 rounded-2xl border text-xs font-extrabold text-center transition-all ${
                  isActive
                    ? 'bg-slate-950 border-slate-700 text-white shadow-lg'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                style={{ borderColor: isActive ? item.color : undefined }}
              >
                <span style={{ color: isActive ? item.color : undefined }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic 3D Core + Story Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* 3D Core Viewport */}
          <div className="lg:col-span-5 h-[320px] rounded-3xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center">
            {isMounted && (
              <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <Suspense fallback={null}>
                  <TransformingSaarthiCore scrollStage={scrollStage} />
                </Suspense>
              </Canvas>
            )}
            <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-500">
              CORE STATE: {scrollStage === 1 ? 'ASK (BLUE)' : scrollStage === 2 ? 'UNDERSTAND (VIOLET)' : 'ACT (GREEN)'}
            </div>
          </div>

          {/* Story Card */}
          <div className="lg:col-span-7 bg-slate-950 p-8 rounded-3xl border border-slate-800/80 shadow-2xl min-h-[320px] flex flex-col justify-between relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* STAGE 1: ASK */}
              {scrollStage === 1 && (
                <motion.div
                  key="stage-1"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5 flex-1 flex flex-col justify-center"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-bold">
                    <MessageSquare className="w-4 h-4" />
                    <span>STAGE 01 — ASK</span>
                    <span className="text-[11px] font-devanagari text-blue-400 font-normal">(विचारा)</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/40 shadow-lg space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">User Request</span>
                    <p className="text-xl sm:text-2xl font-black text-white">
                      "I want more customers."
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Animate the request into the Saarthi interface. Simply state your intent in natural language.
                  </p>
                </motion.div>
              )}

              {/* STAGE 2: UNDERSTAND */}
              {scrollStage === 2 && (
                <motion.div
                  key="stage-2"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5 flex-1 flex flex-col justify-center"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold">
                    <BrainCircuit className="w-4 h-4" />
                    <span>STAGE 02 — UNDERSTAND</span>
                    <span className="text-[11px] font-devanagari text-purple-400 font-normal">(समजून घेतो)</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-purple-300 font-mono">
                      <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span>"Analyzing your business..."</span>
                    </div>
                    <div className="text-xs text-purple-200 font-mono">
                      "Finding opportunities across Customers, Bookings, Marketing, Reviews & Revenue..."
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 text-[10px] font-mono">
                      <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-center">Customers</span>
                      <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-center">Bookings</span>
                      <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-center">Marketing</span>
                      <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-center">Reviews</span>
                      <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-center">Revenue</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: ACT */}
              {scrollStage === 3 && (
                <motion.div
                  key="stage-3"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5 flex-1 flex flex-col justify-center"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>STAGE 03 — ACT</span>
                    <span className="text-[11px] font-devanagari text-emerald-400 font-normal">(कृती करतो)</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>"127 inactive customers found."</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      "Reactivation campaign prepared."
                    </div>
                    <div className="text-xs text-emerald-300 font-bold">
                      "Ready for your approval."
                    </div>

                    <div className="pt-1 flex items-center gap-3">
                      <button
                        onClick={() => (window.location.href = '/dashboard/marketing')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow transition-all hover:scale-105"
                      >
                        [Review campaign]
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Final State Banner */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-base sm:text-xl font-bold text-white tracking-wide font-display">
            "From intention to execution."
          </p>
          <button
            onClick={() => (window.location.href = '/dashboard/ai')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/30 inline-flex items-center gap-2 font-display"
          >
            <span>See Saarthi in action</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
