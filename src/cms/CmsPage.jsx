import { cmsContent } from './runtime'

// Reads the page's published content when the route renders (not when routes are declared), so
// pages reached by in-app navigation get content loaded for them. Undefined -> page's local JSON.
export default function CmsPage({ id, page: Page }) {
  return <Page content={cmsContent(id)} />
}
