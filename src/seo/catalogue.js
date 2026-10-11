// Builds the SEO catalogue from CMS content. `read(path)` returns a content file
// (at least its `seo` block) and `list(dir)` lists a collection folder, both with
// paths relative to src/content and without the .json extension.

const detailRoutes = (base, dir, slugs) => slugs.map(slug => [`${base}/${slug}`, `${dir}/${slug}`])

// Fixed pages in sitemap order; collections expand where they appear.
const routeTable = [
  ['/', 'home'],
  ['/capabilities', 'capabilities/overview'],
  ...detailRoutes('/capabilities', 'capabilities/details', ['data-analytics', 'ai-agent-development', 'cloud-infrastructure', 'cybersecurity', 'automation', 'digital-transformation', 'sustainability']),
  ['/products', 'products/overview'],
  { base: '/products', collection: 'products/details' },
  ['/industries', 'industries/overview'],
  ...detailRoutes('/industries', 'industries/details', ['financial-services', 'healthcare', 'retail-commerce', 'manufacturing', 'government', 'energy-utilities']),
  ['/agentic-ai', 'agentic-ai/overview'],
  ...detailRoutes('/agentic-ai', 'agentic-ai/details', ['orchestrate', 'build-run', 'discover', 'govern', 'scale']),
  ['/how-we-work', 'how-we-work'],
  ['/technology', 'technology'],
  ['/insights', 'insights/overview'],
  { base: '/insights', collection: 'insights/articles', newestFirst: true },
  ['/company', 'company/overview'],
  ['/about', 'company/about'],
  ['/leadership', 'company/leadership'],
  ['/careers', 'company/careers'],
  ['/contact', 'contact'],
  ['/privacy', 'legal/privacy'],
  ['/terms', 'legal/terms'],
  ['/cookies', 'legal/cookies'],
]

// Child routes get a Home › Section › Page breadcrumb trail.
const breadcrumbParents = ['/products', '/capabilities', '/industries', '/agentic-ai', '/insights']

export function buildSeoCatalogue(read, list) {
  const routes = routeTable.flatMap(entry => {
    if (Array.isArray(entry)) return [entry]
    const items = list(entry.collection).map(path => ({ path, data: read(path) }))
    if (entry.newestFirst) items.sort((a, b) => b.data.publishedDate.localeCompare(a.data.publishedDate))
    else items.sort((a, b) => a.path.localeCompare(b.path))
    return items.map(({ path }) => [`${entry.base}/${path.split('/').pop()}`, path])
  })

  const files = Object.fromEntries(routes.map(([route, path]) => [route, read(path)]))
  const pages = {}
  const articles = {}
  const breadcrumbs = {}

  for (const [route] of routes) {
    const file = files[route]
    const { title, description, ogImage } = file.seo
    pages[route] = { title, description, ogImage }

    if (route.startsWith('/insights/')) {
      articles[route] = { headline: file.title, description: file.subtitle, datePublished: file.publishedDate }
    }

    const parent = breadcrumbParents.find(base => route.startsWith(`${base}/`))
    if (parent) {
      const label = file.seo.breadcrumbLabel || file.title
      breadcrumbs[route] = [[files[parent].seo.breadcrumbLabel, parent], [label, route]]
    }
  }

  const leadership = files['/leadership']
  breadcrumbs['/leadership'] = [[files['/company'].seo.breadcrumbLabel, '/company'], [leadership.seo.breadcrumbLabel, '/leadership']]
  const person = {
    route: '/leadership',
    name: leadership.leader.name,
    description: leadership.seo.personDescription,
    sameAs: [leadership.seo.personProfileUrl],
  }

  return { site: read('global/seo'), pages, articles, breadcrumbs, person }
}
