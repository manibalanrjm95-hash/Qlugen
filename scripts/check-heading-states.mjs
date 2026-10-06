import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  await page.route('https://**/*', route => route.abort())
  const base = server.resolvedUrls.local[0].replace(/\/$/, '')
  await page.goto(`${base}/industries`)
  for (const button of await page.locator('.industry-nav-item').all()) {
    await button.focus()
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal((await page.locator('h1').textContent()).trim(), 'Industries')
  }
  await page.goto(`${base}/how-we-work`)
  const comparison = await page.locator('h3.approach-card-title').evaluateAll(headings => headings.map(heading => {
    // Compare the corrected heading with its original paragraph tag, in place.
    const original = document.createElement('p')
    original.className = heading.className
    original.textContent = heading.textContent
    heading.after(original)
    const keys = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'marginTop', 'marginBottom', 'color']
    const oldStyle = getComputedStyle(original)
    const currentStyle = getComputedStyle(heading)
    const differences = keys.filter(key => oldStyle[key] !== currentStyle[key])
    original.remove()
    return differences
  }))
  assert.ok(comparison.every(differences => differences.length === 0), JSON.stringify(comparison))
  await page.goto(`${base}/contact`)
  await page.getByLabel('First name', { exact: true }).fill('Heading')
  await page.getByLabel('Last name', { exact: true }).fill('Check')
  await page.getByLabel('Work email', { exact: true }).fill('heading-check@example.test')
  await page.getByLabel('Company', { exact: true }).fill('Local test')
  await page.getByLabel('Area of interest', { exact: true }).selectOption('Automation')
  await page.getByLabel('Message', { exact: true }).fill('Local heading-state check.')
  // The existing form only changes React state; it makes no network submission.
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.locator('.form-success h2').count(), 1)
  assert.equal(await page.locator('h3,h4,h5,h6').count(), 0)
  console.log('Heading state checks passed: all industry selections, principle heading styles and contact confirmation.')
} finally {
  await browser.close()
  await server.close()
}
