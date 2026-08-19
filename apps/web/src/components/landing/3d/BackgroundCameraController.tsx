'use client';

import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BackgroundCameraControllerProps {
  reducedMotion?: boolean;
  scrollProgressRef: React.MutableRefObject<number>;
  isMobile?: boolean;
}

export const BackgroundCameraController: React.FC<BackgroundCameraControllerProps> = ({
  reducedMotion = false,
  scrollProgressRef,
  isMobile = false,
}) => {
  useFrame((state, delta) => {
    if (reducedMotion) {
      state.camera.position.set(0, 0, 7.5);
      state.camera.lookAt(0, 0, 0);
      return;
    }

    const scroll = scrollProgressRef.current || 0;

    // Mouse parallax target
    const targetX = state.pointer.x * (isMobile ? 0.3 : 0.8);
    const targetY = state.pointer.y * (isMobile ? 0.2 : 0.4) - scroll * 2.0;

    // Ambient floating motion
    const time = state.clock.getElapsedTime();
    const floatY = Math.sin(time * 0.6) * 0.12;

    // Smooth lerp physics
    const lerpSpeed = Math.min(1, delta * 4);
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      targetX,
      lerpSpeed
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetY + floatY + 0.2,
      lerpSpeed
    );

    // Subtle scroll depth adjustment (camera backs out slightly on scroll)
    const baseZ = isMobile ? 8.8 : 7.2;
    const targetZ = baseZ + scroll * 1.5;
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      lerpSpeed
    );

    // Dynamic lookAt with subtle tilt
    const lookAtY = -scroll * 1.2;
    state.camera.lookAt(0, lookAtY, -0.5);
  });

  return null;
};
