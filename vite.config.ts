import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    inspectAttr(), 
    react(),
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
          {
            src: '/products/HAIFLYLOGO.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/products/HAIFLYLOGO.png',
            sizes: '512x512',
            type: 'image/png'
          }
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
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
});
