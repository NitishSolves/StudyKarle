import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Keep dependencies that are large / rarely used in their own chunks so the
// main entry stays small and browsers only download what a route needs.
const manualChunks = {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  axios: ['axios'],
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.monkeycode-ai.live'],
    // Reverse proxy: forward API requests to the backend so the frontend-backend
    // separated app works behind the single exposed port without CORS.
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: manualChunks,
      },
    },
  },
});
