'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, Brain, ShieldCheck } from 'lucide-react';

interface CinematicNodeDef {
  id: string;
  label: string;
  color: string;
  pos: [number, number, number];
  info: string;
}

const CINEMATIC_NODES: CinematicNodeDef[] = [
  { id: 'customers', label: 'CUSTOMERS', color: '#3B82F6', pos: [-2.5, 1.3, 0], info: 'Central CRM profiles & LTV records' },
  { id: 'bookings', label: 'BOOKINGS', color: '#10B981', pos: [2.5, 1.3, 0], info: 'Real-time calendar slots & Razorpay' },
  { id: 'marketing', label: 'MARKETING', color: '#F97316', pos: [-2.3, -1.3, 0], info: 'WhatsApp broadcasts & review replies' },
  { id: 'website', label: 'WEBSITE', color: '#8B5CF6', pos: [2.3, -1.3, 0], info: 'Structured JSON builder & lead forms' },
  { id: 'analytics', label: 'ANALYTICS', color: '#06B6D4', pos: [0, 2.2, -0.2], info: 'Revenue pulse & growth forecasts' },
];

const CinematicCore: React.FC = () => {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.35;
      outerRef.current.rotation.x += delta * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial
          color="#1D4ED8"
          roughness={0.2}
          metalness={0.85}
          emissive="#2563EB"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
};

const CinematicNodeItem: React.FC<{
  node: CinematicNodeDef;
  onHover: (id: string | null) => void;
  hovered: boolean;
}> = ({ node, onHover, hovered }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      const targetScale = hovered ? 1.3 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    if (groupRef.current) {
      groupRef.current.position.y = node.pos[1] + Math.sin(state.clock.getElapsedTime() * 1.8 + node.pos[0]) * 0.08;
    }
  });

  return (
    <group
      ref={groupRef}
      position={node.pos}
      onPointerOver={() => onHover(node.id)}
      onPointerOut={() => onHover(null)}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={node.color}
          roughness={0.2}
          metalness={0.8}
          emissive={hovered ? node.color : '#000000'}
          emissiveIntensity={hovered ? 0.6 : 0.1}
        />
      </mesh>

      <Text
        position={[0, -0.45, 0]}
        color="#F8FAFC"
        fontSize={0.16}
        maxWidth={3}
        anchorX="center"
        anchorY="middle"
      >
        {node.label}
      </Text>
    </group>
  );
};

const CinematicFlowParticle: React.FC<{ start: [number, number, number]; end: [number, number, number]; color: string }> = ({
  start,
  end,
  color,
}) => {
  const pRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!pRef.current) return;
    const t = (state.clock.getElapsedTime() * 0.7) % 1.0;
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    pRef.current.position.copy(p1.lerp(p2, t));
  });

  return (
    <mesh ref={pRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const CinematicConnection: React.FC<{ start: [number, number, number]; end: [number, number, number]; color: string; hovered: boolean }> = ({
  start,
  end,
  color,
  hovered,
}) => {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geom = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      <primitive
        object={
          new THREE.Line(
            geom,
            new THREE.LineBasicMaterial({
              color,
              transparent: true,
              opacity: hovered ? 0.9 : 0.4,
            })
          )
        }
      />
      <CinematicFlowParticle start={start} end={end} color={color} />
    </group>
  );
};

export const IntelligenceSection: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeNodeInfo = CINEMATIC_NODES.find((n) => n.id === hoveredNode);

  return (
    <section className="py-24 px-6 bg-[#020617]/60 backdrop-blur-[1px] text-white border-t border-slate-900/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold text-blue-400">
            <Brain className="w-3.5 h-3.5" />
            <span>INTELLIGENCE LAYER</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Your business, understood.
          </h2>
          <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Saarthi brings your customers, bookings, marketing, website and business activity into one intelligent context.
          </p>
        </div>

        {/* 3D Cinematic Canvas Container */}
        <div className="max-w-5xl mx-auto h-[480px] rounded-3xl bg-gradient-to-b from-[#020617] via-slate-950 to-[#020617] border border-slate-800/80 shadow-2xl relative overflow-hidden">
          {isMounted ? (
            <Canvas camera={{ position: [0, 0, 5.8], fov: 46 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[8, 8, 5]} intensity={1.2} />
              <pointLight position={[-8, -8, -5]} color="#3B82F6" intensity={1.5} />

              <Suspense fallback={null}>
                <CinematicCore />

                {CINEMATIC_NODES.map((node) => {
                  const isHovered = hoveredNode === node.id;
                  return (
                    <React.Fragment key={node.id}>
                      <CinematicNodeItem
                        node={node}
                        onHover={setHoveredNode}
                        hovered={isHovered}
                      />
                      <CinematicConnection
                        start={[0, 0, 0]}
                        end={node.pos}
                        color={node.color}
                        hovered={isHovered}
                      />
                    </React.Fragment>
                  );
                })}
              </Suspense>
            </Canvas>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Loading Intelligence Context 3D...
            </div>
          )}

          {/* Interactive Hover Card Overlay */}
          {activeNodeInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700 text-center shadow-xl space-y-0.5 pointer-events-none"
            >
              <span className="text-xs font-bold" style={{ color: activeNodeInfo.color }}>
                {activeNodeInfo.label} MODULE
              </span>
              <p className="text-[11px] text-slate-300 font-sans">{activeNodeInfo.info}</p>
            </motion.div>
          )}

          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500">
            Saarthi Context Graph v1.0
          </div>
          <div className="absolute top-4 right-4 text-[10px] font-mono text-emerald-400 font-bold">
            • LIVE SYNCHRONIZED
          </div>
        </div>

        {/* Final Statement Banner */}
        <div className="text-center pt-4 border-t border-slate-900">
          <p className="text-base sm:text-2xl font-extrabold text-white tracking-wide">
            "One business. One context. One Saarthi."
          </p>
        </div>
      </div>
    </section>
  );
};
