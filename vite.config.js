import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPlugin } from './scripts/seo-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPlugin(process.env.VITE_ORIGIN || null)],
  server: { historyApiFallback: true },
  build: {
    cssMinify: false,
    cssCodeSplit: false,
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
