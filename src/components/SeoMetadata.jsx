import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metadataTags } from '../seo/metadata.js'
import { productionOrigin } from '../seo/site.js'

export default function SeoMetadata() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!productionOrigin) return
    const nodes = metadataTags(pathname, productionOrigin).map(({ tag, attrs = {}, text }) => {
      const node = document.createElement(tag)
      node.setAttribute('data-qlugen-seo', '')
      for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
      if (text) node.textContent = text
      return node
    })
    document.head.querySelectorAll('title, [data-qlugen-seo]').forEach(node => node.remove())
    document.head.append(...nodes)
  }, [pathname])

  return null
}
