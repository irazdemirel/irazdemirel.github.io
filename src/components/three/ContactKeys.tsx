// İletişim: 3D klavye tuşları (referans 3). Gerçek linkler (<a class="key">) tuşların üstünde
// şeffaf hücreler olarak durur; bu sahne onların hover/basma/odak olaylarını dinler.
// Görününce tuşlar sırayla yerine düşer; basınca çöker, bırakınca yaylanır.
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { ReadyOnFirstFrame, readTokens, SoftLights, useInView, useReducedMotion, type Tokens } from './shared';

type Item = { label: string; text: string };
interface Props { items: Item[]; }
type KeyState = { hover: boolean; press: boolean };

export default function ContactKeys({ items }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, '0px');
  const reduce = useReducedMotion();
  const [t, setT] = useState<Tokens | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const states = useRef<KeyState[]>(items.map(() => ({ hover: false, press: false })));
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    setT(readTokens());
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Gerçek linklerin olaylarını tuş durumlarına çevir
  useEffect(() => {
    const box = root.current?.closest('.keys3d');
    if (!box) return;
    const links = [...box.querySelectorAll<HTMLAnchorElement>('a.key')];
    const off: (() => void)[] = [];
    links.forEach((a, i) => {
      const set = (k: keyof KeyState, v: boolean) => { states.current[i][k] = v; kick.current(); };
      const on: [string, (e: Event) => void][] = [
        ['pointerenter', () => set('hover', true)],
        ['pointerleave', () => { set('hover', false); set('press', false); }],
        ['pointerdown', () => set('press', true)],
        ['pointerup', () => set('press', false)],
        ['pointercancel', () => set('press', false)],
        ['focus', () => set('hover', true)],
        ['blur', () => { set('hover', false); set('press', false); }],
        ['keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') set('press', true); }],
        ['keyup', () => set('press', false)],
      ];
      on.forEach(([ev, fn]) => a.addEventListener(ev, fn));
      off.push(() => on.forEach(([ev, fn]) => a.removeEventListener(ev, fn)));
    });
    return () => off.forEach((f) => f());
  }, []);

  return (
    <div ref={root} className="keys3d-canvas" aria-hidden="true">
      {t && fontsReady && (
        <Canvas
          dpr={[1, 1.5]}
          frameloop={reduce ? 'demand' : inView ? 'always' : 'never'}
          // ortografik: kenardaki tuşlar yamulmaz, tuşlar üstteki link hücreleriyle birebir hizalanır
          orthographic
          camera={{ position: [0, 6, 8], zoom: 100, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          onCreated={({ gl, camera }) => {
            gl.toneMapping = THREE.NeutralToneMapping;
            camera.lookAt(0, 0, 0);
          }}
        >
          <ReadyOnFirstFrame host={root} selector=".keys3d" />
          <SoftLights tint={t.lilac} />
          <Keys items={items} t={t} states={states} reduce={reduce} started={inView} kick={kick} />
          <ContactShadows position={[0, -0.36, 0]} opacity={0.35} scale={14} blur={2.4} far={1.5} frames={1} color={t.plum} />
        </Canvas>
      )}
    </div>
  );
}

function Keys({ items, t, states, reduce, started, kick }: {
  items: Item[]; t: Tokens; states: MutableRefObject<KeyState[]>; reduce: boolean; started: boolean;
  kick: MutableRefObject<() => void>;
}) {
  const { size, camera, invalidate } = useThree();
  // sahne genişliği hep 10 birim; zoom canvas genişliğine göre (1 birim = size.width/10 px)
  const vw = 10;
  useEffect(() => {
    camera.zoom = size.width / vw;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size.width, camera, invalidate]);
  const n = items.length;
  const cell = vw / n;
  const kw = cell * 0.84;
  const kd = kw * 0.62;
  const kh = 0.5;

  const groups = useRef<THREE.Group[]>([]);
  // yay fiziği: konum + hız (giriş düşüşü ve basma/bırakma)
  const sim = useMemo(() => items.map(() => ({ y: reduce ? 0 : 2.6, v: 0 })), [items, reduce]);
  const start = useRef<number | null>(null);
  kick.current = invalidate; // demand modunda olay gelince bir kare çiz

  const labels = useMemo(
    () => items.map((it, i) => labelTexture(it, t.ink[i % 5], kw / kd)),
    [items, t, kw, kd],
  );

  useFrame((state, dt) => {
    if (started && start.current === null) start.current = state.clock.elapsedTime;
    const now = state.clock.elapsedTime;
    const step = Math.min(dt, 1 / 30);
    sim.forEach((s, i) => {
      const st = states.current[i];
      const target = (st.hover ? 0.08 : 0) - (st.press ? 0.26 : 0);
      const g = groups.current[i];
      if (!g) return;
      if (reduce) { g.position.y = target; return; }
      // giriş: sırayla düşer
      // sırası gelmeyen tuş görünmez bekler (havada kameraya çok yakın)
      const waiting = start.current === null || now < start.current + i * 0.09;
      g.visible = !waiting;
      if (waiting) return;
      const k = st.press ? 900 : 260, c = st.press ? 40 : 15;
      s.v += ((target - s.y) * k - s.v * c) * step;
      s.y += s.v * step;
      g.position.y = s.y;
    });
  });

  return (
    <group>
      {/* tuş tabanı */}
      <RoundedBox args={[vw * 0.985, 0.2, kd + 0.36]} radius={0.09} smoothness={4} position={[0, -0.3, 0]}>
        <meshStandardMaterial color={t.plate} roughness={0.6} />
      </RoundedBox>
      {items.map((_, i) => (
        <group key={i} ref={(el) => { if (el) groups.current[i] = el; }} position-x={(i + 0.5 - n / 2) * cell}>
          <RoundedBox args={[kw, kh, kd]} radius={0.09} smoothness={5} position-y={kh / 2 - 0.2}>
            <meshStandardMaterial color={t.spines[i % 5]} roughness={0.45} />
          </RoundedBox>
          <mesh position-y={kh - 0.199} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[kw * 0.88, kd * 0.82]} />
            <meshBasicMaterial map={labels[i]} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Tuş üstü yazısı: büyük etiket + küçük monospace adres
function labelTexture(it: Item, ink: string, aspect: number) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = Math.round(1024 / aspect);
  const ctx = c.getContext('2d')!;
  const css = getComputedStyle(document.documentElement);
  const display = css.getPropertyValue('--font-display');
  const mono = css.getPropertyValue('--font-mono');
  ctx.fillStyle = ink;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${Math.round(c.height * 0.24)}px ${display}`;
  ctx.fillText(`${it.label} ↗`, 54, c.height * 0.48);
  ctx.globalAlpha = 0.75;
  let size = Math.round(c.height * 0.15);
  ctx.font = `500 ${size}px ${mono}`;
  while (ctx.measureText(it.text).width > c.width - 108 && size > 10) ctx.font = `500 ${--size}px ${mono}`;
  ctx.fillText(it.text, 54, c.height * 0.78);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  // eğik bakılan yüzeyde mipmap yazıyı bulanıklaştırır: tek seviye, keskin
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}
