'use client';

import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  reducedMotion?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({ reducedMotion = false }) => {
  useFrame((state) => {
    if (reducedMotion) {
      state.camera.position.set(0, 0.2, 5.8);
      state.camera.lookAt(0, 0, 0);
      return;
    }

    // Subtle parallax response to mouse cursor
    const targetX = state.pointer.x * 0.4;
    const targetY = state.pointer.y * 0.2;
    
    // Ambient camera float
    const floatY = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.08;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY + floatY + 0.2, 0.04);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};
