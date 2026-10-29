// "Yazıyorum": pastel, yuvarlak hatlı retro bilgisayar (tamamı procedural geometri).
// Kaydırdıkça hafifçe döner ve kamera ekrana yaklaşır; imleçle hafif paralaks.
// Ekranda yazı listesi canvas dokusu olarak okunur; ekrana tıklayınca /blog/ açılır.
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ReadyOnFirstFrame, readTokens, SoftLights, usePointer, useReducedMotion, useInView, useScrollProgress, type Tokens } from './shared';

export type ScreenPost = { title: string; date: string };
interface Props { posts: ScreenPost[]; empty: string; prompt: string; }

const { damp, smoothstep } = THREE.MathUtils;

export default function RetroComputer({ posts, empty, prompt }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const reduce = useReducedMotion();
  const progress = useScrollProgress(root);
  // tokenlar ve ekran boyu sadece tarayıcıda okunur (SSR'da canvas yok)
  const [env, setEnv] = useState<{ t: Tokens; small: boolean } | null>(null);
  useEffect(() => setEnv({ t: readTokens(), small: matchMedia('(max-width: 760px)').matches }), []);

  return (
    <div ref={root} className="pc3d-canvas">
      {env && (
        <Canvas
          dpr={env.small ? 1 : [1, 1.5]}
          frameloop={reduce ? 'demand' : inView ? 'always' : 'never'}
          camera={{ fov: 30, position: [0, 0.9, 8] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping; // pasteller solmasın (ACES griye çeker)
          }}
        >
          <ReadyOnFirstFrame host={root} selector=".pc3d" />
          <SoftLights tint={env.t.lilac} />
          <Rig progress={progress} reduce={reduce}>
            <Computer t={env.t} posts={posts} empty={empty} prompt={prompt} reduce={reduce} />
          </Rig>
          <ContactShadows position={[0, -0.8, 0.2]} opacity={0.3} scale={9} blur={2.8} far={2.4} frames={1} color={env.t.plum} />
        </Canvas>
      )}
    </div>
  );
}

// Kamera + sahne dönüşü: kaydırma ilerlemesi (0→1) ve imleç
function Rig({ progress, reduce, children }: { progress: MutableRefObject<number>; reduce: boolean; children: ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const pointer = usePointer();
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const aspect = size.width / size.height;
    const base = Math.max(7.4, 10.6 / aspect); // dar ekranda geri çekil, sahne (fare dahil) sığsın
    const p = reduce ? 0.5 : progress.current;
    const near = smoothstep(p, 0.18, 0.58); // bölüm ortasına gelirken ekrana yaklaş
    const z = base * (1 - (aspect < 1.2 ? 0.38 : 0.2) * near); // dar ekranda ekrana daha çok yaklaş
    const y = 1.1 - 0.3 * near;
    const ry = -0.42 + 0.42 * near + (reduce ? 0 : pointer.current.x * 0.12);
    const rx = reduce ? 0 : pointer.current.y * 0.05;
    const k = reduce ? Infinity : 4; // hareket yoksa doğrudan son hâl
    camera.position.z = damp(camera.position.z, z, k, dt);
    camera.position.y = damp(camera.position.y, y, k, dt);
    camera.position.x = 0.2; // sahnenin ortası (klavye solu … fare sağı)
    look.set(0.2, 0.1 + 0.15 * near, 0.2); // klavye de kadrajda kalsın
    camera.lookAt(look);
    g.current.rotation.y = damp(g.current.rotation.y, ry, k, dt);
    g.current.rotation.x = damp(g.current.rotation.x, rx, k, dt);
  });
  return <group ref={g}>{children}</group>;
}

function Computer({ t, posts, empty, prompt, reduce }: { t: Tokens; posts: ScreenPost[]; empty: string; prompt: string; reduce: boolean }) {
  const plastic = { roughness: 0.55, metalness: 0 };
  return (
    <group>
      {/* Monitör kasası */}
      <RoundedBox args={[2.5, 2.0, 1.7]} radius={0.24} smoothness={5} position={[0, 0.55, -0.45]}>
        <meshStandardMaterial color={t.cream} {...plastic} />
      </RoundedBox>
      {/* Ekran çerçevesi (içe gömük) */}
      <RoundedBox args={[1.98, 1.52, 0.08]} radius={0.1} smoothness={4} position={[-0.2, 0.62, 0.4]}>
        <meshStandardMaterial color={t.creamDeep} {...plastic} />
      </RoundedBox>
      <Screen t={t} posts={posts} empty={empty} prompt={prompt} reduce={reduce} />
      {/* Sağ panel: düğmeler, ışık, havalandırma */}
      {[1.15, 0.92].map((y, i) => (
        <mesh key={y} position={[0.98, y, 0.43]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.075, 0.075, 0.07, 28]} />
          <meshStandardMaterial color={i ? t.lilac : t.pink} roughness={0.35} />
        </mesh>
      ))}
      {[0.66, 0.58, 0.5, 0.42, 0.34, 0.26].map((y) => (
        <RoundedBox key={y} args={[0.26, 0.025, 0.02]} radius={0.01} position={[0.98, y, 0.41]}>
          <meshStandardMaterial color={t.creamDeep} {...plastic} />
        </RoundedBox>
      ))}
      <mesh position={[0.98, 0.06, 0.42]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color={t.mint} emissive={t.mint} emissiveIntensity={1.2} />
      </mesh>
      {/* Ayak */}
      <RoundedBox args={[0.9, 0.2, 0.8]} radius={0.08} position={[0, -0.52, -0.45]}>
        <meshStandardMaterial color={t.creamDeep} {...plastic} />
      </RoundedBox>
      <RoundedBox args={[1.5, 0.12, 1.15]} radius={0.06} position={[0, -0.66, -0.45]}>
        <meshStandardMaterial color={t.cream} {...plastic} />
      </RoundedBox>
      <Keyboard t={t} reduce={reduce} />
      {/* Fare */}
      <group position={[1.62, -0.74, 1.12]} rotation-y={-0.15}>
        <mesh scale={[0.19, 0.09, 0.27]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color={t.pink} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.088, -0.09]} rotation-x={-0.35}>
          <boxGeometry args={[0.006, 0.004, 0.11]} />
          <meshStandardMaterial color={t.plum} />
        </mesh>
      </group>
    </group>
  );
}

// Kavisli tüp ekran: canvas dokusu + üstünde ince cam yansıması
function Screen({ t, posts, empty, prompt, reduce }: { t: Tokens; posts: ScreenPost[]; empty: string; prompt: string; reduce: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.74, 1.3, 24, 24);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / 0.87, y = pos.getY(i) / 0.65;
      pos.setZ(i, 0.06 * (1 - x * x) * (1 - y * y)); // ortası öne bombeli
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const { tex, draw } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 768;
    const ctx = c.getContext('2d')!;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mono = 'ui-monospace, SFMono-Regular, Consolas, monospace';
    const big = matchMedia('(max-width: 760px)').matches;
    const draw = (cursor: boolean) => {
      ctx.fillStyle = t.screen;
      ctx.fillRect(0, 0, c.width, c.height);
      // hafif parıltı + tarama çizgileri
      const glow = ctx.createRadialGradient(512, 384, 80, 512, 384, 640);
      glow.addColorStop(0, `${t.pink}29`); // pembe, %16 opak
      glow.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      for (let y = 0; y < c.height; y += 6) ctx.fillRect(0, y, c.width, 2);

      ctx.fillStyle = t.screenText;
      const s = big ? 1.5 : 1; // telefonda ekran küçük: yazı büyük
      ctx.font = `600 ${40 * s}px ${mono}`;
      ctx.textBaseline = 'top';
      const x0 = 90;
      ctx.fillText(prompt, x0, 110);
      const w = ctx.measureText(prompt).width;
      if (cursor) ctx.fillRect(x0 + w + 10, 112, 22 * s, 40 * s);

      ctx.font = `400 ${34 * s}px ${mono}`;
      const top = 110 + 90 * s;
      if (posts.length === 0) {
        ctx.globalAlpha = 0.75;
        // sığmazsa " · " yerinden iki satıra böl
        const lines = ctx.measureText(empty).width > c.width - 2 * x0 ? empty.split(' · ') : [empty];
        lines.forEach((l, i) => ctx.fillText(l, x0, top + i * 56 * s));
        ctx.globalAlpha = 1;
      } else {
        posts.slice(0, big ? 4 : 7).forEach((p, i) => {
          const y = top + i * 66 * s;
          ctx.globalAlpha = 0.55;
          ctx.fillText(String(i + 1).padStart(2, '0'), x0, y);
          ctx.fillText(p.date, 1024 - 90 - ctx.measureText(p.date).width, y);
          ctx.globalAlpha = 1;
          let title = p.title;
          const max = 1024 - 2 * x0 - 80 - ctx.measureText(p.date).width - 30;
          while (ctx.measureText(title).width > max && title.length > 4) title = title.slice(0, -2);
          if (title !== p.title) title = title.trimEnd() + '…';
          ctx.fillText(title, x0 + 80, y);
        });
      }
      tex.needsUpdate = true;
    };
    return { tex, draw };
  }, [t, posts, empty, prompt]);

  useEffect(() => {
    draw(true);
    invalidate();
    if (reduce) return;
    let on = true;
    const id = setInterval(() => { on = !on; draw(on); }, 530); // yanıp sönen imleç
    return () => clearInterval(id);
  }, [draw, reduce, invalidate]);

  return (
    <group position={[-0.2, 0.62, 0.455]}>
      <mesh
        geometry={geo}
        onClick={() => { location.href = '/blog/'; }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh geometry={geo} position-z={0.012}>
        <meshPhysicalMaterial color="white" transparent opacity={0.1} roughness={0.05} clearcoat={1} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Klavye: tuşlar tek InstancedMesh; görünürken kendi kendine "yazar"
function Keyboard({ t, reduce }: { t: Tokens; reduce: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const pitch = 0.2;
  const keys = useMemo(() => {
    const list: { x: number; z: number; sx: number; edge: boolean }[] = [];
    [-0.32, -0.12, 0.08, 0.28].forEach((z, r) => {
      const n = 12;
      for (let i = 0; i < n; i++) {
        list.push({ x: (i - (n - 1) / 2) * pitch + (r % 2) * 0.04, z, sx: 1, edge: i === 0 || i === n - 1 });
      }
    });
    // alt sıra: ctrl, boşluk, alt
    list.push({ x: -0.95, z: 0.48, sx: 1.6, edge: true }, { x: 0, z: 0.48, sx: 6.4, edge: false }, { x: 0.95, z: 0.48, sx: 1.6, edge: true });
    return list;
  }, []);
  const geo = useMemo(() => new RoundedBoxGeometry(0.17, 0.08, 0.17, 2, 0.035), []);
  const press = useMemo(() => new Float32Array(keys.length), [keys]);
  const m = useMemo(() => new THREE.Object3D(), []);

  const place = () => {
    keys.forEach((k, i) => {
      m.position.set(k.x, 0.1 - press[i] * 0.04, k.z);
      m.scale.set(k.sx, 1, 1);
      m.updateMatrix();
      ref.current.setMatrixAt(i, m.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  };
  useEffect(() => {
    const c = new THREE.Color();
    keys.forEach((k, i) => ref.current.setColorAt(i, c.set(k.edge ? t.pink : t.key)));
    ref.current.instanceColor!.needsUpdate = true;
    place();
  }, [keys, t]);

  const next = useRef(0);
  useFrame((state, dt) => {
    if (reduce) return;
    if (state.clock.elapsedTime > next.current) {
      press[Math.floor(Math.random() * (keys.length - 1))] = 1; // boşluk hariç rastgele tuş
      next.current = state.clock.elapsedTime + 0.09 + Math.random() * 0.14;
    }
    let moving = false;
    for (let i = 0; i < press.length; i++) if (press[i] > 0) { press[i] = Math.max(0, press[i] - dt * 7); moving = true; }
    if (moving) place();
  });

  return (
    <group position={[0, -0.74, 1.05]} rotation-x={0.07}>
      <RoundedBox args={[2.75, 0.14, 1.12]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={t.cream} roughness={0.55} />
      </RoundedBox>
      <instancedMesh ref={ref} args={[geo, undefined, keys.length]}>
        <meshStandardMaterial roughness={0.45} />
      </instancedMesh>
    </group>
  );
}
