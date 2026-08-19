'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlassPanelDef {
  id: number;
  pos: [number, number, number];
  rot: [number, number, number];
  size: [number, number, number];
  floatSpeed: number;
  rotationSpeed: number;
}

export const FloatingGlassStructures: React.FC<{
  reducedMotion?: boolean;
  isMobile?: boolean;
}> = ({ reducedMotion = false, isMobile = false }) => {
  const panels = useMemo<GlassPanelDef[]>(() => {
    if (isMobile) {
      return [
        { id: 1, pos: [-3.5, 1.2, -3.5], rot: [0.2, 0.4, -0.1], size: [2.2, 1.4, 0.05], floatSpeed: 0.6, rotationSpeed: 0.1 },
        { id: 2, pos: [3.8, -1.5, -4.0], rot: [-0.3, -0.2, 0.2], size: [2.5, 1.6, 0.05], floatSpeed: 0.5, rotationSpeed: 0.08 },
      ];
    }

    return [
      { id: 1, pos: [-5.2, 2.5, -3.5], rot: [0.2, 0.5, -0.15], size: [2.6, 1.6, 0.05], floatSpeed: 0.6, rotationSpeed: 0.08 },
      { id: 2, pos: [5.0, 2.0, -4.2], rot: [-0.25, -0.4, 0.2], size: [3.0, 1.8, 0.05], floatSpeed: 0.5, rotationSpeed: 0.06 },
      { id: 3, pos: [-4.8, -2.2, -2.8], rot: [0.15, -0.3, 0.1], size: [2.2, 1.4, 0.05], floatSpeed: 0.7, rotationSpeed: 0.09 },
      { id: 4, pos: [4.5, -2.8, -3.2], rot: [-0.2, 0.3, -0.25], size: [2.8, 1.7, 0.05], floatSpeed: 0.4, rotationSpeed: 0.07 },
      { id: 5, pos: [0, 3.8, -5.0], rot: [0.4, 0, 0.1], size: [4.2, 1.2, 0.05], floatSpeed: 0.3, rotationSpeed: 0.04 },
      { id: 6, pos: [0, -3.8, -4.5], rot: [-0.35, 0.1, -0.1], size: [3.8, 1.1, 0.05], floatSpeed: 0.35, rotationSpeed: 0.05 },
    ];
  }, [isMobile]);

  return (
    <group>
      {panels.map((panel) => (
        <SingleGlassPanel
          key={panel.id}
          panel={panel}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
};

interface SingleGlassPanelProps {
  panel: GlassPanelDef;
  reducedMotion?: boolean;
}

const SingleGlassPanel: React.FC<SingleGlassPanelProps> = ({ panel, reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Gentle vertical float
    groupRef.current.position.y =
      panel.pos[1] + Math.sin(time * panel.floatSpeed + panel.id) * 0.15;
    
    // Slow rotational drift
    if (meshRef.current) {
      meshRef.current.rotation.y = panel.rot[1] + Math.sin(time * panel.rotationSpeed) * 0.1;
      meshRef.current.rotation.x = panel.rot[0] + Math.cos(time * panel.rotationSpeed * 0.8) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={panel.pos}>
      <mesh ref={meshRef} rotation={panel.rot}>
        <boxGeometry args={panel.size} />
        {/* Deep Translucent Dark Glass Material */}
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.35}
          wireframe={false}
        />
        {/* Subtle Frosted Edge Wireframe */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(...panel.size)]} />
          <lineBasicMaterial color="#38BDF8" transparent opacity={0.25} />
        </lineSegments>
      </mesh>
    </group>
  );
};
