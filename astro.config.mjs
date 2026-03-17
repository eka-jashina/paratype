import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://paratype.ru',
  integrations: [
    sitemap(),
    icon({
      iconDir: 'src/icons',
    }),
  ],
  vite: {
    css: {
      devSourcemap: true,
    },
  },
  server: {
    port: 3000,
  },
});
