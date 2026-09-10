import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPlugin } from './scripts/seo-plugin.mjs'
import { productionOrigin } from './src/seo/site.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPlugin(productionOrigin)],
  server: { historyApiFallback: true },
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
