'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingMetricProps {
  position: [number, number, number];
  text: string;
}

export const FloatingMetric: React.FC<FloatingMetricProps> = ({ position, text }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5 + position[0]) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Text
        color="#F8FAFC"
        fontSize={0.22}
        maxWidth={3}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
};
