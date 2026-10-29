import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://irazdemirel.github.io',
  integrations: [sitemap()],
});
