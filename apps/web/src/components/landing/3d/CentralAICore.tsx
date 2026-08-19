'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CentralAICoreProps {
  reducedMotion?: boolean;
  isMobile?: boolean;
}

export const CentralAICore: React.FC<CentralAICoreProps> = ({
  reducedMotion = false,
  isMobile = false,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const outerLatticeRef = useRef<THREE.Mesh>(null!);
  const innerLatticeRef = useRef<THREE.Mesh>(null!);
  const crystalCoreRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Group>(null!);
  const ring2Ref = useRef<THREE.Group>(null!);
  const energyShellRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const time = state.clock.getElapsedTime();

    // Floating breathing effect for the central group
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.12;
    }

    // Outer lattice rotation
    if (outerLatticeRef.current) {
      outerLatticeRef.current.rotation.y += delta * 0.15;
      outerLatticeRef.current.rotation.x += delta * 0.08;
    }

    // Inner lattice counter-rotation
    if (innerLatticeRef.current) {
      innerLatticeRef.current.rotation.y -= delta * 0.25;
      innerLatticeRef.current.rotation.z += delta * 0.12;
    }

    // Specular Crystalline Core rotation & pulse
    if (crystalCoreRef.current) {
      crystalCoreRef.current.rotation.y += delta * 0.35;
      crystalCoreRef.current.rotation.x -= delta * 0.18;
      
      const pulse = Math.sin(time * 2.5) * 0.15 + 0.85;
      const mat = crystalCoreRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.5 * pulse;
      }
    }

    // Orbital ring rotations
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.2;
      ring1Ref.current.rotation.x = Math.sin(time * 0.5) * 0.2 + 0.4;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.28;
      ring2Ref.current.rotation.y = Math.cos(time * 0.6) * 0.2 - 0.5;
    }

    // Energy halo expansion pulse
    if (energyShellRef.current) {
      const scale = 1 + Math.sin(time * 1.5) * 0.04;
      energyShellRef.current.scale.set(scale, scale, scale);
      const mat = energyShellRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.08 + Math.sin(time * 1.5) * 0.04;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.2, -0.5]}>
      {/* Central Soft Ambient Glow Light */}
      <pointLight color="#3B82F6" intensity={isMobile ? 1.5 : 2.5} distance={8} decay={2} />
      <pointLight color="#06B6D4" intensity={isMobile ? 0.8 : 1.4} distance={6} decay={2} position={[0, -1, 1]} />

      {/* Outer Geometric Wireframe Lattice */}
      <mesh ref={outerLatticeRef}>
        <icosahedronGeometry args={[1.8, isMobile ? 1 : 2]} />
        <meshBasicMaterial
          color="#3B82F6"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Inner Geodesic Shell */}
      <mesh ref={innerLatticeRef}>
        <dodecahedronGeometry args={[1.25, 0]} />
        <meshStandardMaterial
          color="#1E3A8A"
          wireframe
          transparent
          opacity={0.35}
          emissive="#2563EB"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Specular Crystalline Core */}
      <mesh ref={crystalCoreRef}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color="#0F172A"
          metalness={0.9}
          roughness={0.1}
          emissive="#3B82F6"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Tilted Orbital Ring 1 */}
      <group ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.3, 0.015, 16, 96]} />
          <meshBasicMaterial color="#60A5FA" transparent opacity={0.5} />
        </mesh>
        {/* Ring Data Node Indicator */}
        <mesh position={[2.3, 0, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#93C5FD" />
        </mesh>
      </group>

      {/* Tilted Orbital Ring 2 */}
      <group ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[2.8, 0.01, 16, 96]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.4} />
        </mesh>
        {/* Ring Node Indicator */}
        <mesh position={[-2.8, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* Atmospheric Energy Shell */}
      <mesh ref={energyShellRef}>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};
