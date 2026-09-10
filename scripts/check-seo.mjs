import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { seoPages } from '../src/seo/pages.js'
import { metadataTags, normalisePath, replaceMetadata, validateOrigin } from '../src/seo/metadata.js'

const origin = 'https://seo-check.example'
const routesSource = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8')
const routes = [...routesSource.matchAll(/<Route path="([^"]+)"/g)].map(match => match[1]).filter(path => path !== '*')
assert.deepEqual(Object.keys(seoPages).sort(), [...routes].sort(), 'Every public route must have metadata')
assert.equal(new Set(Object.values(seoPages).map(page => page.title)).size, routes.length, 'Titles must be unique')
assert.equal(new Set(Object.values(seoPages).map(page => page.description)).size, routes.length, 'Descriptions must be unique')
await access(new URL('../public/social/qlugen.png', import.meta.url))
const image = await readFile(new URL('../public/social/qlugen.png', import.meta.url))
assert.equal(image.readUInt32BE(16), 1200)
assert.equal(image.readUInt32BE(20), 630)
const template = await readFile(new URL('../index.html', import.meta.url), 'utf8')
for (const route of routes) {
  const page = seoPages[route]
  assert.ok(page.title.length <= 60, `${route}: title should be concise`)
  assert.ok(page.description.length <= 165, `${route}: description should be concise`)
  const tags = metadataTags(route, origin)
  const get = name => tags.find(tag => tag.attrs?.name === name || tag.attrs?.property === name)?.attrs.content
  assert.equal(get('description'), page.description)
  assert.equal(get('og:title'), page.title)
  assert.equal(get('og:description'), page.description)
  assert.equal(get('twitter:title'), page.title)
  assert.equal(get('twitter:description'), page.description)
  assert.equal(get('twitter:card'), 'summary_large_image')
  assert.equal(get('og:image'), `${origin}/social/qlugen.png`)
  assert.equal(get('twitter:image'), get('og:image'))
  assert.equal(get('og:url'), `${origin}${route}`)
  assert.equal(tags.find(tag => tag.attrs?.rel === 'canonical').attrs.href, `${origin}${route}`)
  const html = replaceMetadata(replaceMetadata(template, '/', origin), route, origin)
  assert.equal((html.match(/<title\b/g) || []).length, 1)
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1)
  assert.equal(html.split('<body>')[1], template.split('<body>')[1], 'Visible page markup must remain unchanged')
}
assert.equal(normalisePath('/contact/?utm_source=test#form'), '/contact')
assert.ok(metadataTags('/missing', origin).some(tag => tag.attrs?.content === 'noindex, follow'))
assert.ok(!metadataTags('/missing', origin).some(tag => tag.attrs?.rel === 'canonical'))
for (const invalid of ['https://qlugen-enterprise.web.app', 'https://qlugen-enterprise.firebaseapp.com', 'http://example.com', 'https://example.com/']) {
  assert.throws(() => validateOrigin(invalid))
}
console.log(`SEO checks passed for ${routes.length} public routes: unique copy, required tags, canonical URLs, social image, unchanged body and 404 handling.`)
