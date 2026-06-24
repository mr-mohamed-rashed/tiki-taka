import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    manifest: false, // We use the existing public/manifest.webmanifest
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
    }
  }), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
  },
}));