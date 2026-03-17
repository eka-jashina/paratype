import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://paratype.ru',
  integrations: [sitemap()],
  vite: {
    css: {
      devSourcemap: true,
    },
  },
  server: {
    port: 3000,
  },
});
