import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPlugin } from './scripts/seo-plugin.mjs'

// Dev server only (never part of a build): emulator wiring is explicit. By default, local Vite uses
// real Firebase services; set VITE_FIREBASE_USE_EMULATORS=true to point proxies at local emulators.
const useFirebaseEmulators = process.env.VITE_FIREBASE_USE_EMULATORS === 'true'
const cmsDevTarget = process.env.CMS_DEV_API_TARGET || (useFirebaseEmulators
  ? 'http://127.0.0.1:5001/demo-qlugen-cms/asia-south1/cmsAdminApi'
  : 'https://asia-south1-qlugen-enterprise.cloudfunctions.net/cmsAdminApi')
const cmsStorageDevTarget = process.env.CMS_DEV_STORAGE_TARGET || (useFirebaseEmulators ? 'http://127.0.0.1:9199' : 'https://firebasestorage.googleapis.com')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPlugin(process.env.VITE_ORIGIN || null)],
  server: {
    historyApiFallback: true,
    proxy: {
      // The dev server stands in for the single-origin deployment: admin writes are forwarded with
      // the Functions emulator origin, so configured CORS/write-origin checks behave locally.
      '/api/admin': {
        target: cmsDevTarget,
        changeOrigin: true,
      },
      '/v0': {
        target: cmsStorageDevTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    cssMinify: false,
    outDir: 'out',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
