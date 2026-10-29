import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://irazdemirel.github.io',
  // react: 3D adaları (src/components/three/*.tsx, React Three Fiber)
  integrations: [sitemap(), react()],
  // dev: 3D paketleri baştan paketlensin; yoksa geç yüklenen ada (client:visible) yeniden
  // paketlemeye denk gelip "504 Outdated Optimize Dep" ile açılmıyordu (sadece dev'i etkiler)
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'three', '@react-three/fiber', '@react-three/drei', 'gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'],
    },
  },
});
