'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const AtmosphericParticles: React.FC<{
  reducedMotion?: boolean;
  isMobile?: boolean;
}> = ({ reducedMotion = false, isMobile = false }) => {
  const pointsRef = useRef<THREE.Points>(null!);

  const count = isMobile ? 80 : 220;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const baseColor1 = new THREE.Color('#3B82F6'); // Blue
    const baseColor2 = new THREE.Color('#06B6D4'); // Cyan
    const baseColor3 = new THREE.Color('#475569'); // Muted Slate

    for (let i = 0; i < count; i++) {
      // Scatter in wide 3D space
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;

      // Color mixing
      const rand = Math.random();
      let particleColor = baseColor3;
      if (rand > 0.6) particleColor = baseColor1;
      else if (rand > 0.35) particleColor = baseColor2;

      col[i * 3] = particleColor.r;
      col[i * 3 + 1] = particleColor.g;
      col[i * 3 + 2] = particleColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;

    // Slow atmospheric orbit
    pointsRef.current.rotation.y += delta * 0.015;
    pointsRef.current.rotation.x += delta * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.04 : 0.05}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};
