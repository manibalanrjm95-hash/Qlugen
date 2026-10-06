// Isolated integration build: the test origin never enters the production output.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { chromium } from 'playwright'
import { seoPlugin } from './seo-plugin.mjs'
import { seoPages } from '../src/seo/pages.js'
import { replaceMetadata } from '../src/seo/metadata.js'

const origin = 'https://seo-check.example'
const output = resolve('.tmp/seo-check')
await build({
  configFile: false,
  plugins: [react(), {
    name: 'isolated-seo-test-origin',
    transform(code, id) {
      if (id.replaceAll('\\', '/').endsWith('/src/seo/site.js')) {
        return `export const productionOrigin = ${JSON.stringify(origin)}`
      }
    },
  }, seoPlugin(origin)],
  build: { outDir: output, cssMinify: false },
})

const homeHtml = await readFile(resolve(output, 'index.html'), 'utf8')
for (const route of Object.keys(seoPages)) {
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`
  const html = await readFile(resolve(output, file), 'utf8')
  const expectedHead = replaceMetadata(homeHtml, route, origin).match(/<head>([\s\S]*?)<\/head>/)[1]
  const normaliseHead = head => head.replace(/>\s+</g, '><').trim()
  assert.equal(normaliseHead(html.match(/<head>([\s\S]*?)<\/head>/)[1]), normaliseHead(expectedHead))
  assert.equal(html.split('<body>')[1], homeHtml.split('<body>')[1])
}

const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname
  const file = path === '/' ? 'index.html' : Object.hasOwn(seoPages, path) ? `${path.slice(1)}.html` : path.slice(1)
  try {
    const bytes = await readFile(resolve(output, file))
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' }
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream')
    response.end(bytes)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html' })
    response.end(await readFile(resolve(output, '404.html')))
  }
})
await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady))
const local = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  await page.route('https://**/*', route => route.abort())
  const verify = async route => {
    await page.waitForFunction(title => document.title === title, seoPages[route].title)
    const head = await page.evaluate(() => ({
      titleCount: document.head.querySelectorAll('title').length,
      canonicalCount: document.head.querySelectorAll('link[rel="canonical"]').length,
      canonical: document.head.querySelector('link[rel="canonical"]')?.href,
      description: document.head.querySelector('meta[name="description"]')?.content,
      social: document.head.querySelector('meta[property="og:title"]')?.content,
      twitter: document.head.querySelector('meta[name="twitter:title"]')?.content,
    }))
    assert.equal(head.titleCount, 1)
    assert.equal(head.canonicalCount, 1)
    assert.equal(head.canonical, `${origin}${route}`)
    assert.equal(head.description, seoPages[route].description)
    assert.equal(head.social, seoPages[route].title)
    assert.equal(head.twitter, seoPages[route].title)
  }
  for (const route of Object.keys(seoPages)) {
    await page.goto(`${local}${route}`)
    await verify(route)
  }
  await page.goto(`${local}/`)
  await verify('/')
  // Prove React navigation updates metadata without reloading the document.
  await page.evaluate(() => { window.seoNavigationCheck = true })
  await page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'Contact Us', exact: true }).click()
  await verify('/contact')
  assert.equal(await page.evaluate(() => window.seoNavigationCheck), true)
  await page.goBack()
  await verify('/')
  await page.goForward()
  await verify('/contact')
  await page.goto(`${local}/contact?utm_source=seo-check#form`)
  await verify('/contact')
  await page.goto(`${local}/missing-page`)
  await page.waitForFunction(() => document.title === 'Page Not Found | Qlugen')
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, follow')
  assert.equal(await page.locator('link[rel="canonical"]').count(), 0)
  await page.getByRole('link', { name: 'Qlugen home', exact: true }).click()
  await verify('/')
  assert.equal(await page.locator('meta[name="robots"]').count(), 0)
  console.log('Browser SEO checks passed: 36 direct routes, initial HTML, client navigation, history, query/hash canonicalisation, and 404 recovery.')
} finally {
  await browser.close()
  await new Promise(resolveClosed => server.close(resolveClosed))
}
