import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
// @ts-ignore
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    inspectAttr(), 
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false, // We will handle registration manually in App.tsx
      manifest: {
        name: 'Haifly Trap',
        short_name: 'Haifly',
        description: 'Premium non-toxic housefly control solutions.',
        theme_color: '#0f5238',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      injectManifest: {
        injectionPoint: undefined
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:     ['react', 'react-dom'],
          supabase:   ['@supabase/supabase-js'],
          animations: ['gsap', 'animejs', 'lottie-react'],
          icons:      ['lucide-react'],
          charts:     ['recharts'],
          maps:       ['maplibre-gl'],
        }
      }
    }
  }
});
