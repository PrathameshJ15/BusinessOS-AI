'use client';

import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface NodeItemDef {
  id: string;
  name: string;
  subtitle: string;
  pos: [number, number, number];
  color: string;
  accentColor: string;
  shape: 'cube' | 'octahedron' | 'icosahedron' | 'torusKnot';
}

export const STRATEGIC_NODES: NodeItemDef[] = [
  {
    id: 'data-ingestion',
    name: 'DATA INGESTION',
    subtitle: 'Multi-Source Sync',
    pos: [-4.2, 2.0, -1.5],
    color: '#3B82F6',
    accentColor: '#93C5FD',
    shape: 'cube',
  },
  {
    id: 'ai-engine',
    name: 'SAARTHI REASONING',
    subtitle: 'Autonomous Decisioning',
    pos: [-1.8, -1.8, -0.8],
    color: '#6366F1',
    accentColor: '#A5B4FC',
    shape: 'icosahedron',
  },
  {
    id: 'automation-hub',
    name: 'WORKFLOW ENGINE',
    subtitle: 'Zero-Latency Execution',
    pos: [4.2, 1.6, -2.0],
    color: '#06B6D4',
    accentColor: '#67E8F9',
    shape: 'octahedron',
  },
  {
    id: 'business-growth',
    name: 'REVENUE GROWTH',
    subtitle: 'Predictive Expansion',
    pos: [3.6, -2.2, -1.2],
    color: '#10B981',
    accentColor: '#6EE7B7',
    shape: 'torusKnot',
  },
];

interface BusinessNodeSingleProps {
  node: NodeItemDef;
  reducedMotion?: boolean;
  isMobile?: boolean;
}

const BusinessNodeSingle: React.FC<BusinessNodeSingleProps> = ({
  node,
  reducedMotion = false,
  isMobile = false,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireframeRef = useRef<THREE.Mesh>(null!);
  const glowLightRef = useRef<THREE.PointLight>(null!);
  const { camera, pointer } = useThree();

  const [hovered, setHovered] = useState(false);
  const hoverFactor = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth sine wave floating
    if (!reducedMotion) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y =
        node.pos[1] + Math.sin(time * 1.4 + node.pos[0] * 2) * 0.1;
      
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.4;
        meshRef.current.rotation.x += delta * 0.2;
      }
      if (wireframeRef.current) {
        wireframeRef.current.rotation.y -= delta * 0.3;
      }
    }

    // Calculate mouse proximity in screen space
    const worldPos = new THREE.Vector3(...node.pos);
    worldPos.y = groupRef.current.position.y;
    const projected = worldPos.clone().project(camera);
    
    // Normalized distance from cursor pointer [-1..1]
    const dx = projected.x - pointer.x;
    const dy = projected.y - pointer.y;
    const distSq = dx * dx + dy * dy;

    // Proximity threshold squared (approx 0.12 in NDC)
    const isNear = distSq < 0.05;
    if (isNear !== hovered) {
      setHovered(isNear);
    }

    // Lerp hover effect factor
    const targetFactor = isNear ? 1.0 : 0;
    hoverFactor.current = THREE.MathUtils.lerp(hoverFactor.current, targetFactor, delta * 6);

    // Apply scaling & glow based on hover factor
    const scale = 1 + hoverFactor.current * 0.18;
    groupRef.current.scale.set(scale, scale, scale);

    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.2 + hoverFactor.current * 0.6;
      }
    }

    if (glowLightRef.current) {
      glowLightRef.current.intensity = (isMobile ? 0.6 : 1.2) + hoverFactor.current * 1.5;
    }
  });

  const renderGeometry = () => {
    switch (node.shape) {
      case 'cube':
        return <boxGeometry args={[0.7, 0.7, 0.7]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.55, 0]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[0.5, 0]} />;
      case 'torusKnot':
        return <torusKnotGeometry args={[0.35, 0.12, 48, 12]} />;
      default:
        return <boxGeometry args={[0.6, 0.6, 0.6]} />;
    }
  };

  return (
    <group ref={groupRef} position={node.pos}>
      {/* Node Glow Point Light */}
      <pointLight
        ref={glowLightRef}
        color={node.color}
        intensity={isMobile ? 0.6 : 1.2}
        distance={4}
        decay={2}
      />

      {/* Solid Specular Solid Core */}
      <mesh ref={meshRef}>
        {renderGeometry()}
        <meshStandardMaterial
          color={node.color}
          roughness={0.2}
          metalness={0.8}
          emissive={node.color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Outer Wireframe Highlight Shell */}
      <mesh ref={wireframeRef} scale={1.25}>
        {renderGeometry()}
        <meshBasicMaterial
          color={node.accentColor}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

export const BusinessNodesNetwork: React.FC<{
  reducedMotion?: boolean;
  isMobile?: boolean;
}> = ({ reducedMotion = false, isMobile = false }) => {
  return (
    <group>
      {STRATEGIC_NODES.map((node) => (
        <BusinessNodeSingle
          key={node.id}
          node={node}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
};
