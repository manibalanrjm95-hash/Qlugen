import { createContext } from 'react'
import { isMediaRef } from '../lib/media'

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

// Provided by Admin; openLibrary(onSelect) opens the Media Library in picker mode.
export const MediaLibraryContext = createContext({ openLibrary: () => {} })

export function checkImageFile(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG, WebP or AVIF images can be uploaded.'
  if (file.size > MAX_IMAGE_BYTES) return `Image is larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`
  return null
}

// Media ids and URLs referenced by in-browser (possibly unsaved) content. The server only knows
// about saved versions, so the library uses this to also protect images picked but not yet saved.
export function collectMediaRefs(content, refs = new Set()) {
  if (Array.isArray(content)) {
    content.forEach(item => collectMediaRefs(item, refs))
  } else if (isMediaRef(content)) {
    if (content.id) refs.add(content.id)
    if (content.url) refs.add(content.url)
  } else if (content && typeof content === 'object') {
    Object.values(content).forEach(value => collectMediaRefs(value, refs))
  } else if (typeof content === 'string' && content.includes('/media/')) {
    refs.add(content)
  }
  return refs
}
