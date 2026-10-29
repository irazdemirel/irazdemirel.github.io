// Kaydırma animasyonları (referans: Kumo / textura.us videoları)
// - Lenis: yumuşak, ataletli kaydırma
// - data-speed="0.2": parallax (öğe sayfadan farklı hızda kayar)
// - data-slide="left|right": görünür alanda ilerledikçe yatay kayar
// - .hero-out: hero aşağı kaydırıldıkça küçülüp solar
import Lenis from 'lenis';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  if (reduce) return;
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  // iç linkler (#hakkimda vb.) yumuşak gitsin
  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const url = new URL(a.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -64 });
      history.replaceState(null, '', url.hash);
    });
  });

  const parallax = [...document.querySelectorAll<HTMLElement>('[data-speed]')];
  const slides = [...document.querySelectorAll<HTMLElement>('[data-slide]')];
  const hero = document.querySelector<HTMLElement>('.hero-out');
  const vh = () => window.innerHeight;

  const update = () => {
    const h = vh();
    for (const el of parallax) {
      const r = el.parentElement!.getBoundingClientRect();
      const center = r.top + r.height / 2 - h / 2;
      el.style.transform = `translate3d(0, ${(-center * Number(el.dataset.speed)).toFixed(1)}px, 0)`;
    }
    for (const el of slides) {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (r.top + r.height / 2) / h)); // 0 → 1 ekrandan geçerken
      const dir = el.dataset.slide === 'right' ? 1 : -1;
      el.style.transform = `translate3d(${(dir * (0.5 - p) * -18).toFixed(2)}vw, 0, 0)`;
    }
    if (hero) {
      const p = Math.min(1, window.scrollY / (h * 0.9));
      hero.style.transform = `scale(${1 - p * 0.08}) translateY(${p * 40}px)`;
      hero.style.opacity = String(1 - p * 0.7);
    }
  };

  const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  lenis.on('scroll', update);
  addEventListener('resize', update);
  update();
}
