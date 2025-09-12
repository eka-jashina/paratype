import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap';
import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';

import banners from './source/data/banners.json';
import catalogSectionCards from './source/data/catalog-section-cards.json';
import newFonts from './source/data/new-font-cards.json';

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    // SVG спрайт
    VitePluginSvgSpritemap('source/img/sprite/*.svg', {
      styles: false,
      injectSVGOnDev: true, // inline в dev
      output: 'sprite.svg',  // файл для build/preview
    }),

    // Оптимизация изображений
    ViteImageOptimizer({
      test: /\.(jpe?g|png|svg)$/i,
      includePublic: false,
      logStats: true,
      ansiColors: true,
      exclude: [/sprite\.svg$/], // спрайт не трогаем
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupNumericValues: false,
                convertPathData: {
                  floatPrecision: 2,
                  forceAbsolutePath: false,
                  utilizeAbsolute: false,
                },
                removeViewBox: false,
                cleanupIds: false,
              },
            },
          },
          'removeDimensions',
        ],
      },
      png: { quality: 80, palette: true },
      jpeg: { quality: 80, progressive: true },
      jpg: { quality: 80, progressive: true },
      cache: true,
      cacheLocation: './.cache',
    }),

    // Handlebars
    handlebars({
      partialDirectory: resolve(__dirname, 'source/partials'),
      extensions: ['hbs', 'html'],
      reloadOnPartialChange: true,
      compileOptions: { preventIndent: true },
      context: { banners, catalogSectionCards, newFonts },
      helpers: {
        // helper для спрайта
        sprite: (name) => {
          const isDev = process.env.NODE_ENV === 'development';
          return isDev
            ? `__spritemap#sprite-${name}`
            : `./assets/sprite.svg#sprite-${name}`;
        },
      },
    }),
  ],

  esbuild: { exclude: ['.//*.hbs'] },
  css: { devSourcemap: true },
  publicDir: 'public',
  root: './source',
  build: { outDir: '../dist' },
  base: './',
  server: { port: 3000 },
  optimizeDeps: { exclude: ['*.hbs'] },
};
