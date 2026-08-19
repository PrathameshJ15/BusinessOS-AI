'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BusinessNodeProps {
  position: [number, number, number];
  color: string;
  label: string;
  reducedMotion?: boolean;
}

export const BusinessNode: React.FC<BusinessNodeProps> = ({ position, color, label, reducedMotion = false }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.8 + position[0]) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      <Text
        position={[0, -0.45, 0]}
        color="#F8FAFC"
        fontSize={0.2}
        maxWidth={3}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};
