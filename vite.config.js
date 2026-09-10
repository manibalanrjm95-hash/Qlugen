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
  },
})
