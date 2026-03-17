import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    css: {
      devSourcemap: true,
    },
  },
  server: {
    port: 3000,
  },
});
