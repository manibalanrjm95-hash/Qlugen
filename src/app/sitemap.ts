import type { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'

const BASE = 'https://qlugen.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                                          priority: 1.0,  changeFrequency: 'weekly'  },
    { url: `${BASE}/capabilities`,                        priority: 0.9,  changeFrequency: 'monthly' },
    { url: `${BASE}/capabilities/ai-agents-automation`,   priority: 0.8,  changeFrequency: 'monthly' },
    { url: `${BASE}/capabilities/ai-product-development`, priority: 0.8,  changeFrequency: 'monthly' },
    { url: `${BASE}/capabilities/integration-deployment`, priority: 0.8,  changeFrequency: 'monthly' },
    { url: `${BASE}/industries`,                          priority: 0.8,  changeFrequency: 'monthly' },
    { url: `${BASE}/tech-blogs`,                          priority: 0.8,  changeFrequency: 'weekly'  },
    { url: `${BASE}/about`,                               priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${BASE}/executive-team`,                      priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${BASE}/partners`,                            priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${BASE}/careers`,                             priority: 0.7,  changeFrequency: 'weekly'  },
    { url: `${BASE}/contact`,                             priority: 0.6,  changeFrequency: 'monthly' },
  ]

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/tech-blogs/${post.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly',
  }))

  return [...staticRoutes, ...blogRoutes]
}
