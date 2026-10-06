import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { seoPages } from '../src/seo/pages.js'
import { replaceMetadata, validateOrigin } from '../src/seo/metadata.js'
import { renderSitemap, renderRobots } from '../src/seo/crawl.js'

// Emit metadata in the initial HTML for crawlers that do not execute React.
// Firebase exact rewrites serve these files at the existing route URLs.
export function seoPlugin(origin) {
  let outputDirectory
  return {
    name: 'qlugen-page-metadata',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir)
      if (origin) validateOrigin(origin)
    },
    transformIndexHtml(html, context) {
      if (!origin) return html
      const pathname = context.originalUrl || context.path
      return replaceMetadata(html, pathname === '/index.html' ? '/' : pathname, origin)
    },
    async closeBundle() {
      if (!origin) return
      const template = await readFile(resolve(outputDirectory, 'index.html'), 'utf8')
      for (const pathname of Object.keys(seoPages)) {
        if (pathname === '/') continue
        const destination = resolve(outputDirectory, `${pathname.slice(1)}.html`)
        await mkdir(dirname(destination), { recursive: true })
        await writeFile(destination, replaceMetadata(template, pathname, origin))
      }
      await writeFile(resolve(outputDirectory, '404.html'), replaceMetadata(template, '/404', origin))
      await writeFile(resolve(outputDirectory, 'sitemap.xml'), renderSitemap(origin))
      await writeFile(resolve(outputDirectory, 'robots.txt'), renderRobots(origin))
    },
  }
}
