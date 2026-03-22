import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,webp,woff2}'],
        additionalManifestEntries: [
          { url: 'videos/attract-loop-default.mp4',  revision: '1' },
          { url: 'videos/scene-ai-human.mp4',        revision: '1' },
          { url: 'videos/scene-collaboration.mp4',   revision: '1' },
          { url: 'videos/scene-global-scale.mp4',    revision: '1' },
          { url: 'videos/scene-pipeline.mp4',        revision: '1' },
          { url: 'videos/scene-threats.mp4',         revision: '1' },
        ],
        runtimeCaching: [
          {
            urlPattern: /\.mp4$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'videos',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/rest\/v1\//],
      },
      manifest: {
        name: 'Trust & Safety Kiosk',
        short_name: 'T&S Kiosk',
        description: 'Sutherland Trust & Safety Conference Kiosk',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        display: 'fullscreen',
        orientation: 'any',
        start_url: '/TnS/',
        scope: '/TnS/',
        icons: [
          { src: 'icons.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  base: '/TnS/',
  optimizeDeps: {
    include: ['matter-js'],
  },
  build: {
    assetsInlineLimit: 0,
  },
})
