import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/Fahis-portfolio/',
  build: {
    rollupOptions: {
      input: { main: root('./index.html'), work: root('./work.html') },
    },
  },
});
