'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { DataParticle } from './DataParticle';
import { SaarthiCore } from './SaarthiCore';
import { BusinessNode } from './BusinessNode';
import { ConnectionLine } from './ConnectionLine';

export const SaarthiScene: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[460px] flex items-center justify-center bg-slate-950/60 rounded-3xl border border-slate-800">
        <span className="text-xs text-slate-500 font-mono">Loading Saarthi Core 3D...</span>
      </div>
    );
  }

  // 5 Business Nodes surrounding central Saarthi Core
  const nodes: { pos: [number, number, number]; color: string; label: string }[] = [
    { pos: [-2.7, 1.3, -0.4], color: '#3B82F6', label: 'Customers' },
    { pos: [2.7, 1.2, -0.4], color: '#10B981', label: 'Analytics' },
    { pos: [-2.3, -1.3, 0.3], color: '#F59E0B', label: 'Website' },
    { pos: [2.3, -1.2, 0.3], color: '#8B5CF6', label: 'Marketing' },
    { pos: [0, -2.1, -0.2], color: '#06B6D4', label: 'Bookings' },
  ];

  return (
    <div className="w-full h-[460px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 48 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.3} />
        <pointLight position={[-10, -10, -5]} color="#3B82F6" intensity={1.5} />

        <Suspense fallback={null}>
          <CameraController reducedMotion={reducedMotion} />
          {!reducedMotion && <DataParticle />}
          <SaarthiCore reducedMotion={reducedMotion} />

          {nodes.map((node, i) => (
            <React.Fragment key={i}>
              <BusinessNode
                position={node.pos}
                color={node.color}
                label={node.label}
                reducedMotion={reducedMotion}
              />
              <ConnectionLine start={[0, 0, 0]} end={node.pos} color={node.color} />
            </React.Fragment>
          ))}
        </Suspense>
      </Canvas>

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-slate-400 font-mono pointer-events-none">
        <span>SAARTHI BUSINESS CORE</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>5 BUSINESS NODES CONNECTED</span>
        </span>
      </div>
    </div>
  );
};
