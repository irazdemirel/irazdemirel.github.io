// Hero: avatarın arkasında yavaş dönen pastel cam/sedef halka (tek efekt).
// Sadece geniş ekranda yüklenir (client:media); hazır olunca CSS parıltısının yerini alır.
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { markReady, readTokens, SoftLights, usePointer, useInView, useReducedMotion, type Tokens } from './shared';

export default function HeroRing() {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, '0px');
  const reduce = useReducedMotion();
  const [t, setT] = useState<Tokens | null>(null);
  useEffect(() => setT(readTokens()), []);

  return (
    <div ref={root} className="ring3d" aria-hidden="true">
      {t && (
        <Canvas
          dpr={[1, 1.5]}
          frameloop={reduce ? 'demand' : inView ? 'always' : 'never'}
          camera={{ fov: 30, position: [0, 0, 6] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping;
            markReady(root.current, '.visual', 'ring-ready');
          }}
        >
          <SoftLights tint={t.lilac} />
          <Ring t={t} reduce={reduce} />
        </Canvas>
      )}
    </div>
  );
}

function Ring({ t, reduce }: { t: Tokens; reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const pointer = usePointer();
  useFrame((state, dt) => {
    if (reduce) return;
    ring.current.rotation.z += dt * 0.12; // yavaş dönüş
    const tt = state.clock.elapsedTime;
    const { damp } = THREE.MathUtils;
    g.current.rotation.x = damp(g.current.rotation.x, 1.05 + Math.sin(tt * 0.4) * 0.06 + pointer.current.y * 0.1, 3, dt);
    g.current.rotation.y = damp(g.current.rotation.y, -0.25 + pointer.current.x * 0.15, 3, dt);
  });
  return (
    <group ref={g} rotation={[1.05, -0.25, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[1.3, 0.028, 32, 160]} />
        <meshPhysicalMaterial
          color={t.pink} emissive={t.pink} emissiveIntensity={0.35}
          roughness={0.3} metalness={0} transparent opacity={0.85}
          clearcoat={1} clearcoatRoughness={0.1}
          iridescence={0.35} iridescenceIOR={1.3} iridescenceThicknessRange={[180, 420]}
        />
      </mesh>
    </group>
  );
}
