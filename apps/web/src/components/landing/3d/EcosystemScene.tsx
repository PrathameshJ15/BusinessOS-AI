'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface EcosystemSceneProps {
  scrollProgress: number; // 0 to 1
}

interface NodeDef {
  id: string;
  label: string;
  color: string;
  pos: [number, number, number];
  stageThreshold: number; // scroll progress at which this node reveals
}

const NODES: NodeDef[] = [
  { id: 'customers', label: 'CUSTOMERS', color: '#3B82F6', pos: [-2.6, 1.4, 0], stageThreshold: 0.15 },
  { id: 'website', label: 'WEBSITE', color: '#8B5CF6', pos: [2.6, 1.4, 0], stageThreshold: 0.3 },
  { id: 'marketing', label: 'MARKETING', color: '#F97316', pos: [-2.4, -1.4, 0], stageThreshold: 0.45 },
  { id: 'bookings', label: 'BOOKINGS', color: '#10B981', pos: [2.4, -1.4, 0], stageThreshold: 0.6 },
  { id: 'analytics', label: 'ANALYTICS', color: '#06B6D4', pos: [0, 2.3, -0.3], stageThreshold: 0.75 },
];

const CentralCore: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * (0.3 + scrollProgress * 0.5);
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
        <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.5} />
      </mesh>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial
          color="#1E40AF"
          roughness={0.2}
          metalness={0.8}
          emissive="#2563EB"
          emissiveIntensity={0.5 + scrollProgress * 0.5}
        />
      </mesh>
    </group>
  );
};

const NodeItem: React.FC<{
  node: NodeDef;
  active: boolean;
  onHover: (id: string | null) => void;
  hovered: boolean;
}> = ({ node, active, onHover, hovered }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (!active) return;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      const targetScale = hovered ? 1.25 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    if (groupRef.current) {
      groupRef.current.position.y = node.pos[1] + Math.sin(state.clock.getElapsedTime() * 2 + node.pos[0]) * 0.1;
    }
  });

  if (!active) return null;

  return (
    <group
      ref={groupRef}
      position={node.pos}
      onPointerOver={() => onHover(node.id)}
      onPointerOut={() => onHover(null)}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial
          color={node.color}
          roughness={0.2}
          metalness={0.7}
          emissive={hovered ? node.color : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>

      <Text
        position={[0, -0.5, 0]}
        color="#F8FAFC"
        fontSize={0.18}
        maxWidth={3}
        anchorX="center"
        anchorY="middle"
      >
        {node.label}
      </Text>
    </group>
  );
};

const FlowParticles: React.FC<{ start: [number, number, number]; end: [number, number, number]; color: string }> = ({
  start,
  end,
  color,
}) => {
  const particleRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!particleRef.current) return;
    const t = (state.clock.getElapsedTime() * 0.8) % 1.0;
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const pos = p1.lerp(p2, t);
    particleRef.current.position.copy(pos);
  });

  return (
    <mesh ref={particleRef}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const LineConnection: React.FC<{ start: [number, number, number]; end: [number, number, number]; color: string; active: boolean }> = ({
  start,
  end,
  color,
  active,
}) => {
  if (!active) return null;
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geom = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      <primitive object={new THREE.Line(geom, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }))} />
      <FlowParticles start={start} end={end} color={color} />
    </group>
  );
};

export const EcosystemScene: React.FC<EcosystemSceneProps> = ({ scrollProgress }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-slate-950 rounded-3xl border border-slate-800">
        <span className="text-xs text-slate-500 font-mono">Initializing Business Ecosystem 3D...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 6], fov: 46 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} color="#3B82F6" intensity={1.5} />

        <Suspense fallback={null}>
          <CentralCore scrollProgress={scrollProgress} />

          {NODES.map((node) => {
            const isActive = scrollProgress >= node.stageThreshold;
            const isHovered = hoveredNode === node.id;
            return (
              <React.Fragment key={node.id}>
                <NodeItem
                  node={node}
                  active={isActive}
                  onHover={setHoveredNode}
                  hovered={isHovered}
                />
                <LineConnection
                  start={[0, 0, 0]}
                  end={node.pos}
                  color={node.color}
                  active={isActive}
                />
              </React.Fragment>
            );
          })}
        </Suspense>
      </Canvas>

      {/* Stage Status Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
        <span className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-xl border border-slate-800">
          STAGE {Math.min(7, Math.floor(scrollProgress * 7) + 1)} OF 7: SYNCHRONIZING
        </span>
        <span className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-xl border border-slate-800 text-blue-400 font-bold">
          {Math.round(scrollProgress * 100)}% CONNECTED
        </span>
      </div>
    </div>
  );
};
