import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://irazdemirel.github.io',
  // react: 3D adaları (src/components/three/*.tsx, React Three Fiber)
  integrations: [sitemap(), react()],
});
