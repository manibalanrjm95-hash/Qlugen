// Browser: bundle only each page's `seo` block; files needed for structured data load in full.
const seoBlocks = import.meta.glob(['../content/**/*.json', '!../content/global/**'], { eager: true, import: 'seo' })
const fullFiles = import.meta.glob(['../content/insights/articles/*.json', '../content/company/leadership.json', '../content/global/seo.json'], { eager: true, import: 'default' })

const prefix = '../content/'
const fileKey = path => `${prefix}${path}.json`

export const readContent = path => fullFiles[fileKey(path)] || { seo: seoBlocks[fileKey(path)] }

export const listContent = dir => Object.keys(seoBlocks)
  .filter(key => key.startsWith(`${prefix}${dir}/`) && !key.slice(prefix.length + dir.length + 1).includes('/'))
  .map(key => key.slice(prefix.length, -'.json'.length))
