import { useEffect, useState } from 'react'
import { Routes, useLocation } from 'react-router-dom'
import { isCmsContentReady, loadPublishedContentFor } from './runtime'

// <Routes> that, with the CMS runtime enabled, keeps showing the current page during in-app
// navigation until the next page's published content has loaded (or failed over to local JSON),
// so a page never flashes local content before its CMS content. With the runtime off it is
// exactly <Routes>.
export default function CmsRoutes({ children }) {
  const location = useLocation()
  const [shownLocation, setShownLocation] = useState(location)
  const [, setLoadCount] = useState(0)
  const ready = isCmsContentReady(location.pathname)

  if (ready && shownLocation !== location) setShownLocation(location)

  useEffect(() => {
    if (ready) return undefined
    let cancelled = false
    loadPublishedContentFor(location.pathname).finally(() => {
      if (!cancelled) setLoadCount(count => count + 1)
    })
    return () => { cancelled = true }
  }, [location.pathname, ready])

  return <Routes location={ready ? location : shownLocation}>{children}</Routes>
}
