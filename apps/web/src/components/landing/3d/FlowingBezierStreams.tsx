'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STRATEGIC_NODES } from './BusinessNodesNetwork';

interface StreamPathDef {
  id: string;
  points: THREE.Vector3[];
  color: string;
  speed: number;
  particleCount: number;
}

export const FlowingBezierStreams: React.FC<{
  reducedMotion?: boolean;
  isMobile?: boolean;
}> = ({ reducedMotion = false, isMobile = false }) => {
  // Define 3D Bezier splines connecting the nodes and central AI core
  const streams = useMemo<StreamPathDef[]>(() => {
    const aiCorePos = new THREE.Vector3(0, 0.2, -0.5);
    
    const nodeMap = new Map(
      STRATEGIC_NODES.map((n) => [n.id, new THREE.Vector3(...n.pos)])
    );

    const dataPos = nodeMap.get('data-ingestion') || new THREE.Vector3(-4.2, 2.0, -1.5);
    const reasoningPos = nodeMap.get('ai-engine') || new THREE.Vector3(-1.8, -1.8, -0.8);
    const autoPos = nodeMap.get('automation-hub') || new THREE.Vector3(4.2, 1.6, -2.0);
    const growthPos = nodeMap.get('business-growth') || new THREE.Vector3(3.6, -2.2, -1.2);

    return [
      // Stream 1: Data -> AI Core
      {
        id: 'data-to-core',
        points: [
          dataPos,
          new THREE.Vector3(-2.2, 1.4, -1.0),
          aiCorePos,
        ],
        color: '#3B82F6',
        speed: 0.25,
        particleCount: isMobile ? 3 : 6,
      },
      // Stream 2: AI Core -> AI Reasoning Node
      {
        id: 'core-to-reasoning',
        points: [
          aiCorePos,
          new THREE.Vector3(-1.0, -0.8, -0.6),
          reasoningPos,
        ],
        color: '#6366F1',
        speed: 0.3,
        particleCount: isMobile ? 2 : 5,
      },
      // Stream 3: AI Reasoning -> Workflow Engine
      {
        id: 'reasoning-to-auto',
        points: [
          reasoningPos,
          new THREE.Vector3(1.2, 0.0, -1.4),
          autoPos,
        ],
        color: '#06B6D4',
        speed: 0.28,
        particleCount: isMobile ? 3 : 6,
      },
      // Stream 4: Workflow Engine -> Revenue Growth
      {
        id: 'auto-to-growth',
        points: [
          autoPos,
          new THREE.Vector3(4.5, -0.2, -1.6),
          growthPos,
        ],
        color: '#10B981',
        speed: 0.22,
        particleCount: isMobile ? 3 : 6,
      },
      // Stream 5: Core -> Revenue Growth direct feedback spline
      {
        id: 'core-to-growth',
        points: [
          aiCorePos,
          new THREE.Vector3(1.8, -1.0, -0.8),
          growthPos,
        ],
        color: '#38BDF8',
        speed: 0.2,
        particleCount: isMobile ? 2 : 4,
      },
    ];
  }, [isMobile]);

  return (
    <group>
      {streams.map((stream) => (
        <SingleStream
          key={stream.id}
          stream={stream}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
};

interface SingleStreamProps {
  stream: StreamPathDef;
  reducedMotion?: boolean;
}

const SingleStream: React.FC<SingleStreamProps> = ({ stream, reducedMotion = false }) => {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(stream.points, false, 'catmullrom', 0.5);
  }, [stream.points]);

  const lineGeometry = useMemo(() => {
    const points = curve.getPoints(64);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [curve]);

  const instancedRef = useRef<THREE.InstancedMesh>(null!);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (reducedMotion || !instancedRef.current) return;

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < stream.particleCount; i++) {
      // Offset each particle along the curve length 0..1
      const phase = (i / stream.particleCount);
      const t = (time * stream.speed + phase) % 1.0;
      
      const pos = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);

      dummy.position.copy(pos);
      
      // Orient particle along curve tangent
      const target = pos.clone().add(tangent);
      dummy.lookAt(target);

      // Pulse size slightly
      const pulseScale = 0.05 + Math.sin(t * Math.PI) * 0.03;
      dummy.scale.set(pulseScale, pulseScale, pulseScale * 2.5);

      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
    }
    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Underlying Translucent Spline Cable */}
      <primitive
        object={
          new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
              color: stream.color,
              transparent: true,
              opacity: 0.25,
              linewidth: 1,
            })
          )
        }
      />

      {/* Instanced Flowing Energy Pulses */}
      {!reducedMotion && (
        <instancedMesh
          ref={instancedRef}
          args={[undefined, undefined, stream.particleCount]}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial
            color={stream.color}
            transparent
            opacity={0.85}
          />
        </instancedMesh>
      )}
    </group>
  );
};
