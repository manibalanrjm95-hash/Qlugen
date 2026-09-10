import { createServer } from 'vite'
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { seoPages } from '../src/seo/pages.js'

const phase = process.argv[2] || 'after'
if (!['before', 'after'].includes(phase)) throw new Error('Expected before or after')
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const browser = await chromium.launch({ headless: true })
const results = {}
try {
  const page = await browser.newPage()
  await page.route('https://**/*', route => route.abort())
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of [...Object.keys(seoPages), '/heading-audit-not-found']) {
      await page.goto(`${server.resolvedUrls.local[0].replace(/\/$/, '')}${path}`)
      await page.locator('main').waitFor()
      const data = await page.evaluate(() => {
        const headingSelector = 'h1,h2,h3,h4,h5,h6'
        const headings = [...document.querySelectorAll(headingSelector)].map(node => ({
          level: Number(node.tagName[1]), text: node.textContent.trim(),
          section: node.closest('section')?.className || '',
          parentSectionH2: Boolean(node.closest('section')?.querySelector('h2')),
        }))
        const visual = [...document.querySelectorAll(`${headingSelector}, .section-label, [data-heading-visual]`)].map(node => {
          const style = getComputedStyle(node)
          const keys = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'marginTop', 'marginBottom', 'textTransform', 'display']
          const bounds = node.getBoundingClientRect()
          return { text: node.textContent.trim(), tag: node.tagName, className: node.className,
            style: Object.fromEntries(keys.map(key => [key, style[key]])),
            width: bounds.width, height: bounds.height }
        })
        return { headings, visual }
      })
      results[`${width}:${path}`] = data
    }
  }
  await mkdir('.tmp/heading-audit', { recursive: true })
  await writeFile(`.tmp/heading-audit/${phase}.json`, JSON.stringify(results, null, 2))
  const issues = Object.entries(results).filter(([key]) => key.startsWith('1440:')).flatMap(([key, { headings }]) => {
    const count = headings.filter(h => h.level === 1).length
    const messages = count !== 1 ? [`${key}: ${count} H1s`] : []
    let level = 0
    for (const heading of headings) {
      if (heading.level > level + 1) messages.push(`${key}: H${level} to H${heading.level}: ${heading.text}`)
      level = heading.level
    }
    return messages
  })
  console.log(JSON.stringify({ phase, routes: Object.keys(results).length / 2, issues }, null, 2))
  if (phase === 'after' && issues.length) process.exitCode = 1
} finally {
  await browser.close()
  await server.close()
}
