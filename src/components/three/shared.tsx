// 3D adalarının ortak parçaları: renk tokenları, görünürlük, hareket tercihi,
// kaydırma ilerlemesi (Lenis'e bağlı ScrollTrigger) ve ortak ışık kurulumu.
import { useEffect, useRef, useState, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// Renkler tokens.css'ten okunur (bileşende hex yok)
export function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    pink: v('--spine-1'), lilac: v('--spine-2'), peach: v('--spine-3'), mint: v('--spine-4'), plum: v('--spine-5'),
    accentSoft: v('--accent-soft'), accentStrong: v('--accent-strong'),
    cream: v('--3d-cream'), creamDeep: v('--3d-cream-deep'), key: v('--3d-key'),
    screen: v('--3d-screen'), screenText: v('--3d-screen-text'), plate: v('--3d-plate'),
    ink: [1, 2, 3, 4, 5].map((i) => v(`--ink-${i}`)),
    spines: [1, 2, 3, 4, 5].map((i) => v(`--spine-${i}`)),
  };
}
export type Tokens = ReturnType<typeof readTokens>;

// Ekranda (veya yakınında) mı? Ekran dışında render durur.
export function useInView(ref: RefObject<Element | null>, margin = '120px') {
  const [inView, set] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { rootMargin: margin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

export function useReducedMotion() {
  // SSR'da window yok: başta false, tarayıcıda hemen gerçek değer
  const [reduce, set] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => set(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}

// Öğe ekrana alttan girerken 0, üstten çıkarken 1
export function useScrollProgress(ref: RefObject<Element | null>) {
  const p = useRef(0);
  useEffect(() => {
    if (!ref.current) return;
    const st = ScrollTrigger.create({
      trigger: ref.current, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => { p.current = self.progress; },
    });
    p.current = st.progress;
    return () => st.kill();
  }, [ref]);
  return p;
}

// İmleç: ekran ortası 0, kenarlar -1 / 1
export function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      p.current.x = (e.clientX / innerWidth) * 2 - 1;
      p.current.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener('pointermove', on, { passive: true });
    return () => removeEventListener('pointermove', on);
  }, []);
  return p;
}

// Adanın hazır olduğunu sayfaya bildir (CSS fallback'i gizlemek için)
export function markReady(el: Element | null, selector: string, cls = 'ready') {
  el?.closest(selector)?.classList.add(cls);
}

// Yumuşak stüdyo ışığı: ambient + 1 key + rim, yansımalar için ışık panelleri
export function SoftLights({ tint }: { tint: string }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.9} color={tint} />
      <SoftEnv tint={tint} />
    </>
  );
}

// Yansıma ortamı: birkaç parlak panel → PMREM. (drei <Environment> HDR/EXR yükleyicileri
// pakete katıyordu, ~80 KB; burada sadece three.js çekirdeği, ağdan dosya inmez)
function SoftEnv({ tint }: { tint: string }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const room = new THREE.Scene();
    const panel = (color: string, power: number, pos: [number, number, number], w: number, h: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
      );
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      room.add(m);
    };
    panel('white', 2.2, [0, 4, 3], 6, 2);
    panel(tint, 1.2, [-5, 1, 0], 4, 4);
    panel('white', 0.8, [5, 0, -1], 3, 3);
    const rt = pm.fromScene(room, 0.04);
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.dispose();
      pm.dispose();
      room.traverse((o) => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); o.material.dispose(); } });
    };
  }, [gl, scene, tint]);
  return null;
}
