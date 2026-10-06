// Metadata comes from each page's CMS `seo` block. The catalogue is shared by the
// HTML build and client-side navigation; '#seo-content' resolves to a disk reader
// in Node and to bundled JSON in the browser (see package.json "imports").
import { readContent, listContent } from '#seo-content'
import { buildSeoCatalogue } from './catalogue.js'

export const seoCatalogue = buildSeoCatalogue(readContent, listContent)
export const seoPages = seoCatalogue.pages
