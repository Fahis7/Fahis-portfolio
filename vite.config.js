import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(p, import.meta.url));
const BASE = '/Fahis-portfolio/';

// Homepage: preload the fonts used above the fold (Inter 400 + 500, IBM Plex Mono 500), so the hero text doesn't
// re-flow when they arrive. Their file names are hashed at build time, so the links are added from the bundle.
const ABOVE_FOLD_FONTS = [/^inter-latin-400-normal-.*\.woff2$/, /^inter-latin-500-normal-.*\.woff2$/, /^ibm-plex-mono-latin-500-normal-.*\.woff2$/];
const preloadFonts = () => ({
  name: 'preload-hero-fonts',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      if (!ctx.bundle || !ctx.filename.endsWith('index.html')) return html;
      const files = Object.keys(ctx.bundle).filter((f) => ABOVE_FOLD_FONTS.some((re) => re.test(f.split('/').pop())));
      return files.map((f) => ({
        tag: 'link', injectTo: 'head-prepend',
        attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: BASE + f, crossorigin: '' },
      }));
    },
  },
});

export default defineConfig({
  plugins: [react(), preloadFonts()],
  base: BASE,
  // the footer's "Last updated" date, fixed at build time
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString()) },
  build: {
    // older iPhones (Safari / iOS 15+): without this the CSS minifier rewrites (max-width: 899px) as (width<=899px),
    // which Safari before 16.4 can't read, so it drops every phone media block
    cssTarget: ['safari15', 'ios15'],
    rollupOptions: {
      input: { main: root('./index.html'), work: root('./work.html'), cv: root('./cv.html') },
    },
  },
});
