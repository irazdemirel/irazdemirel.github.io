// Hareket altyapısı: Lenis (yumuşak kaydırma) + GSAP ScrollTrigger + SplitText
// Tüm kaydırma animasyonları burada; bileşenler sadece işaret (data-*/class) koyar.
// - [data-split]: başlık harf harf gelir (SplitText)
// - .reveal: ekrana girince yumuşakça belirir (ScrollTrigger.batch)
// - [data-speed="0.12"]: parallax (öğe sayfadan farklı hızda kayar)
// - .hero-out: hero aşağı kaydırıldıkça hafifçe küçülüp solar
// - [data-pin-steps]: bölüm pinlenir, zaman çizelgesi adım adım dolar (--p 0→1)
// - .tank: akvaryum görününce balık dalar (.dropped)
// - [data-tilt]: kart imlece göre hafif 3D eğilir
// prefers-reduced-motion: hiçbiri çalışmaz, her şey son hâlinde statik durur.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initMotion() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.documentElement.classList.remove('motion');
    document.querySelectorAll('.tank').forEach((t) => t.classList.add('dropped'));
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const lenis = smoothScroll();
    titles();
    reveals();
    parallax();
    heroOut();
    tank();
    const untilt = tilt();
    return () => { lenis.destroy(); untilt(); };
  });

  // Zaman çizelgesi: masaüstünde pin + scrub, dar/kısa ekranda pinsiz scrub
  mm.add(
    {
      pin: '(prefers-reduced-motion: no-preference) and (min-width: 761px) and (min-height: 640px)',
      flow: '(prefers-reduced-motion: no-preference) and ((max-width: 760px) or (max-height: 639px))',
    },
    (ctx) => timeline(Boolean(ctx.conditions?.pin)),
  );
}

function smoothScroll() {
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // iç linkler (#iletisim vb.) yumuşak gitsin
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const el = document.querySelector<HTMLElement>(url.hash);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { offset: -64 });
    history.replaceState(null, '', url.hash);
  };
  document.addEventListener('click', onClick);
  return {
    destroy() {
      gsap.ticker.remove(tick);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    },
  };
}

// Bölüm başlıkları: harfler alttan, hafif bulanıklıktan gelir (Kumo "Selected works")
function titles() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'words,chars', // kelime sarmalı: satır kelime ortasından kırılmasın
      aria: 'auto',
      onSplit: (self) => {
        el.classList.add('split-ready');
        return gsap.from(self.chars, {
          yPercent: 40, autoAlpha: 0, filter: 'blur(8px)',
          duration: 0.8, ease: 'expo.out', stagger: 0.035,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      },
    });
  });
}

function reveals() {
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }),
  });
}

function parallax() {
  gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
    const speed = Number(el.dataset.speed);
    const box = el.parentElement!;
    // öğenin ortası ekran ortasındayken kayma 0
    const half = () => (innerHeight + box.offsetHeight) / 2;
    // aşağıdayken yukarı, yukarıdayken aşağı kayık: sayfadan biraz yavaş akar
    gsap.fromTo(el, { y: () => -half() * speed }, {
      y: () => half() * speed, ease: 'none',
      scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });
}

function heroOut() {
  const hero = document.querySelector<HTMLElement>('.hero-out');
  if (!hero) return;
  gsap.to(hero, {
    scale: 0.92, y: 40, opacity: 0.3, ease: 'none',
    scrollTrigger: { start: 0, end: () => innerHeight * 0.9, scrub: true },
  });
}

function tank() {
  document.querySelectorAll<HTMLElement>('.tank').forEach((t) => {
    ScrollTrigger.create({ trigger: t, start: 'top 65%', once: true, onEnter: () => t.classList.add('dropped') });
  });
}

// [data-tilt] kartlar: imlece göre hafif 3D eğilme + parlama (--gx/--gy). Sadece fareli cihazda.
function tilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const off: (() => void)[] = [];
  gsap.utils.toArray<HTMLElement>('[data-tilt]').forEach((el) => {
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      rx(-y * 8); ry(x * 10);
      el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
      el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
    };
    const leave = () => { rx(0); ry(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    off.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
  });
  return () => off.forEach((f) => f());
}

// "Öğrenirken paylaşıyorum": çizgi dolar, adımlar sırayla yanar
function timeline(pin: boolean) {
  document.querySelectorAll<HTMLElement>('[data-pin-steps]').forEach((section) => {
    const line = section.querySelector<HTMLElement>('.timeline')!;
    const steps = gsap.utils.toArray<HTMLElement>('.step', section);
    gsap.set(steps, { autoAlpha: 0.15, x: 40 });
    gsap.set(section.querySelectorAll('.dot'), { scale: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: pin
        ? { trigger: section, start: 'top top', end: () => `+=${innerHeight * 1.2}`, pin: true, scrub: 0.6, anticipatePin: 1 }
        : { trigger: line, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
    });
    tl.fromTo(line, { '--p': 0 }, { '--p': 1, ease: 'none', duration: steps.length }, 0);
    steps.forEach((st, i) => {
      tl.to(st, { autoAlpha: 1, x: 0, duration: 0.6 }, i)
        .to(st.querySelector('.dot'), { scale: 1, ease: 'back.out(2.2)', duration: 0.5 }, i + 0.1);
    });
  });
}
