'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SaarthiCoreProps {
  reducedMotion?: boolean;
}

export const SaarthiCore: React.FC<SaarthiCoreProps> = ({ reducedMotion = false }) => {
  const outerMeshRef = useRef<THREE.Mesh>(null!);
  const innerMeshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    if (outerMeshRef.current) {
      outerMeshRef.current.rotation.y += delta * 0.25;
      outerMeshRef.current.rotation.x += delta * 0.12;
    }
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y -= delta * 0.4;
      innerMeshRef.current.rotation.z += delta * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Geometric Shell */}
      <mesh ref={outerMeshRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#3B82F6"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Pulsing Intelligence Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.9, 0.02, 16, 64]} />
        <meshBasicMaterial color="#60A5FA" transparent opacity={0.6} />
      </mesh>

      {/* Inner Metallic Heart Core */}
      <mesh ref={innerMeshRef}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color="#1D4ED8"
          roughness={0.15}
          metalness={0.85}
          emissive="#2563EB"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
};
