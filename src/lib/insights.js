import { cmsContent } from '../cms/runtime'

// Insight articles are a CMS collection: one JSON file per article, newest first. Each article
// resolves to its published CMS version (id `insight-<file name>`) when the CMS runtime is enabled.
const modules = import.meta.glob('../content/insights/articles/*.json', { eager: true, import: 'default' })

export const getArticles = () => Object.entries(modules)
  .map(([file, local]) => cmsContent(`insight-${file.split('/').pop().replace(/\.json$/, '')}`, local))
  .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))

export const findArticle = slug => getArticles().find(article => article.slug === slug)
