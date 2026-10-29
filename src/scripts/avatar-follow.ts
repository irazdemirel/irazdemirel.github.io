// Avatar imleç takibi (ortak): kareler bir kez ImageBitmap'e çözülür, canvas'a çizilir.
// Tek rAF döngüsü + yaylı yumuşatma; sonuç kökte --mx / --my (-1..1).
// Kare değişince kök 'avatar:frame' olayı yayar (detail: canvas) → 3D köpük bunu doku olarak kullanır.
// Kök: [data-frames] taşıyan öğe, içinde img.still (ilk kare). Hareket azaltmada hiçbir şey yapmaz.
export function followAvatar(root: HTMLElement) {
  const srcs: string[] = JSON.parse(root.dataset.frames || '[]');
  const img = root.querySelector<HTMLImageElement>('img.still');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const touch = matchMedia('(hover: none)').matches;

  let bitmaps: ImageBitmap[] = [];
  let ctx: CanvasRenderingContext2D | null = null;
  let started = false, drawn = -1;
  // Açılışı yavaşlatmasın: sayfa yüklendikten hemen sonra (ya da ilk fare hareketinde) iner
  const loadFrames = () => {
    if (started || !img || !srcs.length || !('createImageBitmap' in window)) return;
    started = true;
    Promise.all(srcs.map((s) => fetch(s).then((r) => r.blob()).then((b) => createImageBitmap(b))))
      .then((bmps) => {
        bitmaps = bmps;
        const c = document.createElement('canvas');
        c.width = bmps[0].width; c.height = bmps[0].height;
        c.className = img.className;
        c.setAttribute('role', 'img');
        c.setAttribute('aria-label', img.alt);
        ctx = c.getContext('2d');
        img.replaceWith(c);
        drawn = -1; kick();
      })
      .catch(() => {}); // olmazsa tek kare kalır, eğilme yine çalışır
  };
  window.addEventListener('pointermove', loadFrames, { once: true, passive: true });
  const soon = () => setTimeout(loadFrames, 600);
  if (document.readyState === 'complete') soon(); else window.addEventListener('load', soon, { once: true });

  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, last = 0;
  const frame = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const k = 1 - Math.exp(-dt * 11);
    x += (tx - x) * k; y += (ty - y) * k;
    if (ctx) {
      const f = Math.round(((x + 1) / 2) * (bitmaps.length - 1)); // 01 = sola bakış … son = sağa
      if (f !== drawn) {
        ctx.drawImage(bitmaps[f], 0, 0, ctx.canvas.width, ctx.canvas.height);
        drawn = f;
        root.dispatchEvent(new CustomEvent('avatar:frame', { detail: ctx.canvas }));
      }
    }
    root.style.setProperty('--mx', x.toFixed(4));
    root.style.setProperty('--my', y.toFixed(4));
    if (Math.abs(tx - x) + Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(frame);
    else { raf = 0; last = 0; }
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  // İmleç avatarın merkezine göre: ~1.2 avatar genişliği uzakta tam yana bakar
  const aim = (cx: number, cy: number) => {
    const r = root.getBoundingClientRect();
    const s = Math.max(r.width * 1.2, 280);
    tx = clamp((cx - (r.left + r.width / 2)) / s);
    ty = clamp((cy - (r.top + r.height / 2)) / s);
    kick();
  };

  if (!touch) {
    window.addEventListener('pointermove', (e) => aim(e.clientX, e.clientY), { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  } else {
    // Dokunmatik: avatar arada bir yavaşça etrafına bakar (sadece ekrandayken)
    let on = false, start = 0;
    const idle = (ts: number) => {
      if (!on) return;
      if (!start) start = ts;
      const p = ((ts - start) / 7000) % 1; // 7 sn'lik döngü
      tx = p < 0.6 ? 0 : 0.9 * Math.sin(((p - 0.6) / 0.4) * Math.PI * 2);
      ty = p < 0.6 ? 0 : -0.15 * Math.sin(((p - 0.6) / 0.4) * Math.PI);
      kick();
      requestAnimationFrame(idle);
    };
    new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
      if (on) { start = 0; requestAnimationFrame(idle); }
    }).observe(root);
  }
}
