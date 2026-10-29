// Hero: avatarın arkasında dönen pastel cam/sedef halka + üzerinde kayan bir inci (tek efekt).
// Avatarla aynı imleç değerlerini (--mx/--my) okur: avatar nereye bakarsa halka o yana yatar.
// Avatarın üzerine gelince halka hızlanır ve parlar. Açılışta büyüyerek belirir.
// Sadece geniş ekranda yüklenir (client:media); hazır olunca CSS parıltısının yerini alır.
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { markReady, readTokens, SoftLights, useInView, useReducedMotion, type Tokens } from './shared';

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
          <Ring t={t} reduce={reduce} host={root} />
        </Canvas>
      )}
    </div>
  );
}

const R = 1.3; // halka yarıçapı

function Ring({ t, reduce, host }: { t: Tokens; reduce: boolean; host: React.RefObject<HTMLDivElement | null> }) {
  const g = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const pearl = useRef<THREE.Mesh>(null!);
  const speed = useRef(0.25);
  const grow = useRef(reduce ? 1 : 0);

  useFrame((state, dt) => {
    if (reduce) return;
    const { damp } = THREE.MathUtils;
    const visual = host.current?.closest('.visual');
    const avatar = visual?.querySelector<HTMLElement>('.avatar');
    const mx = Number(avatar?.style.getPropertyValue('--mx') || 0);
    const my = Number(avatar?.style.getPropertyValue('--my') || 0);
    const hover = Boolean(visual?.matches(':hover'));

    // açılış: 0 → 1 (yumuşak büyüme + belirme)
    grow.current = damp(grow.current, 1, 2.2, dt);
    g.current.scale.setScalar(0.7 + 0.3 * grow.current);

    // dönüş hızı: normalde yavaş, avatarın üzerindeyken hızlı
    speed.current = damp(speed.current, hover ? 1.1 : 0.25, 3, dt);
    spin.current.rotation.z += dt * speed.current;

    // halka imlece doğru yatar (avatarla aynı yön)
    const tt = state.clock.elapsedTime;
    g.current.rotation.x = damp(g.current.rotation.x, 1.05 + Math.sin(tt * 0.4) * 0.05 + my * 0.28, 4, dt);
    g.current.rotation.y = damp(g.current.rotation.y, -0.25 + mx * 0.4, 4, dt);

    mat.current.opacity = 0.85 * grow.current;
    mat.current.emissiveIntensity = damp(mat.current.emissiveIntensity, hover ? 0.6 : 0.35, 3, dt);
    // inci hafifçe nefes alır
    pearl.current.scale.setScalar(1 + Math.sin(tt * 2.2) * 0.08);
  });

  return (
    <group ref={g} rotation={[1.05, -0.25, 0]}>
      <group ref={spin}>
        <mesh>
          <torusGeometry args={[R, 0.028, 32, 160]} />
          <meshPhysicalMaterial
            ref={mat}
            color={t.pink} emissive={t.pink} emissiveIntensity={0.35}
            roughness={0.3} metalness={0} transparent opacity={reduce ? 0.85 : 0}
            clearcoat={1} clearcoatRoughness={0.1}
            iridescence={0.35} iridescenceIOR={1.3} iridescenceThicknessRange={[180, 420]}
          />
        </mesh>
        {/* sedef inci: halkayla birlikte döner, avatarın arkasından geçer */}
        <mesh ref={pearl} position={[R, 0, 0]}>
          <sphereGeometry args={[0.075, 32, 32]} />
          <meshPhysicalMaterial
            color={t.key} emissive={t.accentSoft} emissiveIntensity={0.25}
            roughness={0.15} clearcoat={1} clearcoatRoughness={0.05}
            iridescence={0.8} iridescenceIOR={1.4} iridescenceThicknessRange={[200, 500]}
          />
        </mesh>
      </group>
    </group>
  );
}
