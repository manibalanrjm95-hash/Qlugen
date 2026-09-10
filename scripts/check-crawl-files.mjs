import assert from 'node:assert/strict'
import { readFile, mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { seoPages } from '../src/seo/pages.js'
import { metadataTags } from '../src/seo/metadata.js'
import { renderSitemap, renderRobots } from '../src/seo/crawl.js'
import { seoPlugin } from './seo-plugin.mjs'

// Test-only origin. Production always reads the confirmed src/seo/site.js value.
const origin = 'https://crawl-check.example'
const sitemap = renderSitemap(origin)
const robots = renderRobots(origin)
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
const routeSource = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8')
const routes = [...routeSource.matchAll(/<Route path="([^"]+)"/g)].map(match => match[1]).filter(path => path !== '*')

assert.ok(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
assert.ok(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'))
assert.equal(urls.length, 36)
assert.equal(new Set(urls).size, urls.length)
assert.deepEqual(urls.toSorted(), routes.map(path => `${origin}${path}`).toSorted())
for (const path of Object.keys(seoPages)) {
  const canonical = metadataTags(path, origin).find(tag => tag.attrs?.rel === 'canonical').attrs.href
  assert.ok(urls.includes(canonical), `${path}: sitemap must match the canonical URL`)
}
assert.ok(urls.every(url => !/404|debug|preview|\.html|web\.app|firebaseapp\.com/.test(url)))
assert.equal(robots, `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`)
assert.ok(!robots.includes('Disallow:'))
for (const invalid of [null, '', 'https://qlugen-enterprise.web.app', 'https://qlugen-enterprise.firebaseapp.com']) {
  assert.throws(() => renderSitemap(invalid))
  assert.throws(() => renderRobots(invalid))
}

// Exercise the actual Vite output hook, separate from the deployment directory.
await mkdir('.tmp', { recursive: true })
const output = await mkdtemp(resolve('.tmp/crawl-check-'))
await writeFile(resolve(output, 'index.html'), '<html><head><title>Test</title></head><body><div id="root"></div></body></html>')
const plugin = seoPlugin(origin)
plugin.configResolved({ root: process.cwd(), build: { outDir: output } })
await plugin.closeBundle()
assert.equal(await readFile(resolve(output, 'sitemap.xml'), 'utf8'), sitemap)
assert.equal(await readFile(resolve(output, 'robots.txt'), 'utf8'), robots)

// An unconfirmed origin must never produce a guessed production sitemap.
const inactiveOutput = await mkdtemp(resolve('.tmp/crawl-unconfirmed-'))
const inactive = seoPlugin(null)
inactive.configResolved({ root: process.cwd(), build: { outDir: inactiveOutput } })
await inactive.closeBundle()
await assert.rejects(readFile(resolve(inactiveOutput, 'sitemap.xml')), { code: 'ENOENT' })
await assert.rejects(readFile(resolve(inactiveOutput, 'robots.txt')), { code: 'ENOENT' })
console.log(`Crawl checks passed: ${urls.length} public canonical URLs, no non-public entries, unrestricted asset crawling, and verified Vite output.`)
