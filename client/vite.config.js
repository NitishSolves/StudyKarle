import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // pdfjs-dist (used for in-app PDF rendering) relies on top-level await,
    // which needs a slightly newer JS target than Vite 2's default.
    target: 'es2022'
  }
});
