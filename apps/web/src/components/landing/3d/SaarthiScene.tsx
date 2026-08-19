'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { DataParticle } from './DataParticle';
import { SaarthiCore } from './SaarthiCore';
import { BusinessNode } from './BusinessNode';
import { ConnectionLine } from './ConnectionLine';
import { FloatingMetric } from './FloatingMetric';

export const SaarthiScene: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-950/40 rounded-3xl border border-slate-800">
        <span className="text-xs text-slate-500 font-mono">Initializing Saarthi 3D Scene...</span>
      </div>
    );
  }

  const nodes: { pos: [number, number, number]; color: string; label: string }[] = [
    { pos: [-2.6, 1.2, -0.5], color: '#3B82F6', label: 'CRM' },
    { pos: [2.6, 1.1, -0.5], color: '#10B981', label: 'Revenue' },
    { pos: [-2.2, -1.3, 0.2], color: '#F59E0B', label: 'Website' },
    { pos: [2.2, -1.2, 0.2], color: '#8B5CF6', label: 'Marketing' },
  ];

  return (
    <div className="w-full h-[450px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} color="#3B82F6" intensity={1.5} />

        <Suspense fallback={null}>
          <CameraController />
          <DataParticle />
          <SaarthiCore />

          {nodes.map((node, i) => (
            <React.Fragment key={i}>
              <BusinessNode position={node.pos} color={node.color} label={node.label} />
              <ConnectionLine start={[0, 0, 0]} end={node.pos} color={node.color} />
            </React.Fragment>
          ))}

          <FloatingMetric position={[-2.6, 1.7, 0]} text="Unified CRM" />
          <FloatingMetric position={[2.6, 1.6, 0]} text="₹ Analytics" />
          <FloatingMetric position={[-2.2, -1.8, 0]} text="AI Website" />
          <FloatingMetric position={[2.2, -1.7, 0]} text="Broadcasts" />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-slate-400 font-mono pointer-events-none">
        <span>SAARTHI 3D CORE ENGINE</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>INTERACTIVE NODES ACTIVE</span>
        </span>
      </div>
    </div>
  );
};
