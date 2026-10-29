// Hero avatarı · Cam sabun köpüğü: avatar diski, kırılan ve gökkuşağı yansıtan bir köpüğün içinde.
// Köpük yüzeyi küçük bir shader ile dalgalanır; fare hızlı hareket edince dalga büyür, sonra yatışır.
// Avatar kareleri (avatar-follow.ts → 'avatar:frame') diske doku olarak çizilir. Sadece geniş ekranda yüklenir.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ReadyOnFirstFrame, readTokens, SoftLights, useInView, useReducedMotion, type Tokens } from './shared';

export default function AvatarBubble() {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, '0px');
  const reduce = useReducedMotion();
  const [t, setT] = useState<Tokens | null>(null);
  useEffect(() => setT(readTokens()), []);

  return (
    <div ref={root} className="bubble3d" aria-hidden="true">
      {t && (
        <Canvas
          dpr={[1, 1.5]}
          frameloop={reduce ? 'demand' : inView ? 'always' : 'never'}
          camera={{ fov: 30, position: [0, 0, 6] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping;
          }}
        >
          <ReadyOnFirstFrame host={root} selector=".bubble" />
          <SoftLights tint={t.lilac} />
          <Scene host={root} reduce={reduce} />
        </Canvas>
      )}
    </div>
  );
}

const R = 1.3; // köpük yarıçapı

function Scene({ host, reduce }: { host: React.RefObject<HTMLDivElement | null>; reduce: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const disc = useRef<THREE.Mesh>(null!);
  const discMat = useRef<THREE.MeshBasicMaterial>(null!);
  const last = useRef({ mx: 0, my: 0 });
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uAmp: { value: 0.02 } }), []);

  // Doku: önce ilk kare (img), kareler gelince canvas
  useEffect(() => {
    const box = host.current?.closest<HTMLElement>('.bubble');
    if (!box) return;
    const img = box.querySelector<HTMLImageElement>('img.still');
    let tex: THREE.Texture | null = null;
    if (img) {
      new THREE.TextureLoader().load(img.currentSrc || img.src, (tx) => {
        if (tex) return; // canvas daha önce geldiyse
        tx.colorSpace = THREE.SRGBColorSpace;
        tex = tx;
        discMat.current.map = tx; discMat.current.needsUpdate = true;
      });
    }
    let canvasTex: THREE.CanvasTexture | null = null;
    const toCanvas = (c: HTMLCanvasElement) => {
      if (!canvasTex) {
        canvasTex = new THREE.CanvasTexture(c);
        canvasTex.colorSpace = THREE.SRGBColorSpace;
        tex?.dispose();
        tex = canvasTex;
        discMat.current.map = canvasTex; discMat.current.needsUpdate = true;
      }
      canvasTex.needsUpdate = true;
    };
    const onFrame = (e: Event) => toCanvas((e as CustomEvent<HTMLCanvasElement>).detail);
    // kareler adadan önce yüklendiyse img yerinde canvas vardır
    const ready = box.querySelector<HTMLCanvasElement>('canvas.still');
    if (ready) toCanvas(ready);
    box.addEventListener('avatar:frame', onFrame);
    return () => { box.removeEventListener('avatar:frame', onFrame); tex?.dispose(); };
  }, [host]);

  const bubbleMat = useMemo(() => {
    // Köpük zarı (özel shader): ortası saydam, kenara doğru gökkuşağı ince film rengi + iki ışık lekesi.
    // Yüzey dalgası: köşe noktaları normal yönünde azıcık itilir.
    const tk = readTokens();
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { ...uniforms, uTint: { value: new THREE.Color(tk.lilac) }, uPink: { value: new THREE.Color(tk.pink) } },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uAmp;
        varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main() {
          vec3 p = position;
          float w = sin(p.x * 3.1 + uTime * 1.3) * sin(p.y * 2.7 + uTime * 1.1) + 0.5 * sin(p.z * 4.0 - uTime * 1.7);
          p += normal * uAmp * w;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          vP = p;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uTint; uniform vec3 uPink;
        varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main() {
          vec3 n = normalize(vN), v = normalize(vV);
          float f = 1.0 - clamp(dot(n, v), 0.0, 1.0);      // 0 ortada, 1 kenarda
          float rim = pow(f, 2.4);
          // ince film: bakış açısı ve konuma göre kayan gökkuşağı, pastele çekilmiş
          float ph = f * 1.7 + vP.y * 0.35 + vP.x * 0.15 + uTime * 0.04;
          vec3 film = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + ph));
          film = mix(film, mix(uTint, uPink, 0.5 + 0.5 * sin(ph * 3.0)), 0.35);
          film = mix(vec3(1.0), film, 0.7);
          // ışık lekeleri: sol üstte büyük, sağ altta küçük
          vec3 r = reflect(-v, n);
          float s1 = pow(max(dot(r, normalize(vec3(-0.75, 0.8, 0.45))), 0.0), 90.0);
          float s2 = pow(max(dot(r, normalize(vec3(0.5, -0.45, 0.75))), 0.0), 160.0);
          float a = clamp(rim * 0.9 + 0.035 + s1 * 0.9 + s2 * 0.6, 0.0, 1.0);
          vec3 col = film * (0.75 + rim * 0.35) + vec3(s1 + s2 * 0.8);
          gl_FragColor = vec4(col, a);
        }`,
    });
  }, [uniforms]);
  useEffect(() => () => bubbleMat.dispose(), [bubbleMat]);

  useFrame((state, dt) => {
    if (reduce) return;
    const { damp } = THREE.MathUtils;
    const box = host.current?.closest<HTMLElement>('.bubble');
    const mx = Number(box?.style.getPropertyValue('--mx') || 0);
    const my = Number(box?.style.getPropertyValue('--my') || 0);
    // fare hızı → dalga genliği
    const v = Math.hypot(mx - last.current.mx, my - last.current.my) / Math.max(dt, 1e-3);
    last.current = { mx, my };
    const hover = Boolean(box?.matches(':hover'));
    const target = Math.min(0.045, 0.014 + v * 0.012 + (hover ? 0.008 : 0));
    uniforms.uAmp.value = damp(uniforms.uAmp.value, target, target > uniforms.uAmp.value ? 8 : 1.5, dt);
    uniforms.uTime.value += dt * (1 + uniforms.uAmp.value * 20);

    const tt = state.clock.elapsedTime;
    group.current.position.y = Math.sin(tt * 0.9) * 0.05; // hafif süzülme
    group.current.rotation.y = damp(group.current.rotation.y, mx * 0.18, 4, dt);
    group.current.rotation.x = damp(group.current.rotation.x, my * 0.12, 4, dt);
    disc.current.rotation.y = damp(disc.current.rotation.y, mx * 0.12, 4, dt); // köpük içinde hafif paralaks
  });

  return (
    <group ref={group}>
      <mesh ref={disc}>
        <circleGeometry args={[R * 0.93, 96]} />
        <meshBasicMaterial ref={discMat} color="white" toneMapped={false} />
      </mesh>
      <mesh material={bubbleMat}>
        <sphereGeometry args={[R, 128, 96]} />
      </mesh>
    </group>
  );
}
