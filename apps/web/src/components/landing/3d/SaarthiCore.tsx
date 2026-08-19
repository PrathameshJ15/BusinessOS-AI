'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SaarthiCore: React.FC = () => {
  const outerMeshRef = useRef<THREE.Mesh>(null!);
  const innerMeshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (outerMeshRef.current) {
      outerMeshRef.current.rotation.y += delta * 0.4;
      outerMeshRef.current.rotation.x += delta * 0.2;
    }
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y -= delta * 0.6;
      innerMeshRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Wireframe Core */}
      <mesh ref={outerMeshRef}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshBasicMaterial
          color="#3B82F6"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Inner Solid Geometric Intelligence Heart */}
      <mesh ref={innerMeshRef}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#2563EB"
          roughness={0.2}
          metalness={0.8}
          emissive="#1E40AF"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};
