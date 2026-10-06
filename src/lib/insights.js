// Insight articles are a CMS collection: one JSON file per article, newest first.
const modules = import.meta.glob('../content/insights/articles/*.json', { eager: true, import: 'default' })

export const articles = Object.values(modules).sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))

export const findArticle = slug => articles.find(article => article.slug === slug)
