import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import NotFound from '../pages/NotFound'
import TemplatePage from './TemplatePage'
import { cmsRuntimeEnabled, loadPublishedRoute } from './runtime'

// Catch-all route: renders a PUBLISHED page created with "+ Add Page" using its approved template.
// React Router matches every coded route first, and the CMS refuses slugs that belong to coded
// routes, so a CMS page can never replace a coded page. Anything else shows the normal 404.
export default function DynamicCmsPage() {
  const { pathname } = useLocation()
  const [result, setResult] = useState({ pathname: null, page: null })

  useEffect(() => {
    if (!cmsRuntimeEnabled) return undefined
    let cancelled = false
    loadPublishedRoute(pathname).then(page => {
      if (!cancelled) setResult({ pathname, page })
    })
    return () => { cancelled = true }
  }, [pathname])

  const page = result.pathname === pathname ? result.page : null

  useEffect(() => {
    if (!page?.content?.seo) return
    const { title, description } = page.content.seo
    if (title) document.title = title
    const meta = document.querySelector('meta[name="description"]')
    if (meta && description) meta.setAttribute('content', description)
  }, [page])

  if (!cmsRuntimeEnabled) return <NotFound />
  if (result.pathname !== pathname) return null
  return page ? <TemplatePage templateKey={page.template} content={page.content} /> : <NotFound />
}
