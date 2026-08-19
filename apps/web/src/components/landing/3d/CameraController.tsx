'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CameraController: React.FC = () => {
  useFrame((state) => {
    // Subtle mouse parallax rotation
    const targetX = (state.pointer.x * 0.5);
    const targetY = (state.pointer.y * 0.3);
    
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY + 0.2, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};
