import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPlugin } from './scripts/seo-plugin.mjs'

// Dev server only (never part of a build): forward CMS calls to the local Worker started by
// `npm run cms:dev`, so `npm run dev` + /admin work without setting VITE_CMS_API_BASE.
const cmsDevTarget = process.env.CMS_DEV_API_TARGET || 'http://127.0.0.1:8787'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPlugin(process.env.VITE_ORIGIN || null)],
  server: {
    historyApiFallback: true,
    proxy: {
      // The dev server stands in for the single-origin deployment: admin writes are forwarded with
      // the Worker's own Origin, so its same-origin write check behaves as in staging.
      '/api/admin': {
        target: cmsDevTarget,
        changeOrigin: true,
        configure: proxy => proxy.on('proxyReq', proxyReq => {
          if (proxyReq.getHeader('origin')) proxyReq.setHeader('origin', new URL(cmsDevTarget).origin)
        }),
      },
      '/api/public': cmsDevTarget,
      '/media': cmsDevTarget,
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
