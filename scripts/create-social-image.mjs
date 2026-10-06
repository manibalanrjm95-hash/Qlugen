// Rasterise the existing logo assets for Open Graph/Twitter compatibility.
// This asset is only referenced in metadata, never in the page layout.
import { readFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const logo = async name => `data:image/svg+xml;base64,${(await readFile(new URL(`../src/assets/${name}.svg`, import.meta.url))).toString('base64')}`
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#F3F8FC;display:flex;align-items:center;justify-content:center;width:1200px;height:630px;gap:28px">
    <img alt="" src="${await logo('logo-icon')}" style="width:210px;height:auto">
    <img alt="Qlugen" src="${await logo('logo-wordmark')}" style="width:500px;height:auto">
  </body></html>`)
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
  await mkdir(new URL('../public/social/', import.meta.url), { recursive: true })
  await page.screenshot({ path: fileURLToPath(new URL('../public/social/qlugen.png', import.meta.url)) })
} finally {
  await browser.close()
}
