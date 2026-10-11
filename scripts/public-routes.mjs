import { readFile, readdir } from 'node:fs/promises'

// Public routes from main.jsx, with CMS collection routes (/:slug) expanded from their content folders.
const collections = { '/products/:slug': 'products/details', '/insights/:slug': 'insights/articles' }

export async function publicRoutes() {
  const source = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8')
  const declared = [...source.matchAll(/<Route path="([^"]+)"/g)].map(match => match[1]).filter(path => path !== '*')
  const routes = []
  for (const path of declared) {
    if (!collections[path]) { routes.push(path); continue }
    const files = await readdir(new URL(`../src/content/${collections[path]}/`, import.meta.url))
    routes.push(...files.filter(file => file.endsWith('.json')).map(file => path.replace(':slug', file.slice(0, -'.json'.length))))
  }
  return routes
}
