// Approved page templates for "+ Add Page". Code-controlled: editors pick one of these, they can
// never create templates. This module holds DATA ONLY (shared by the admin, the public runtime and
// the CMS Worker); the React component for each template is bound in TemplatePage.jsx.
//
// Each template defines:
//   key            stable id stored in cms_pages.template_id (never shown to editors)
//   name           friendly name shown in the admin
//   group          admin sidebar section where pages made from it are listed
//   contentType    content type used for validation and previews
//   defaultContent initial draft content. It is also the template's content SCHEMA: a page made
//                  from the template may only contain these fields, with the same field types
//                  (text, list, group); images may also hold a media-library reference.
//   requiredFields fields that must not be empty before saving
import { isImageKey, isMediaRef } from '../lib/media.js'

const heroImage = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1800&q=80'
const visualImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
const ogImage = '/social/qlugen.png'

const relatedCapabilities = {
  heading: 'Related capabilities',
  items: [
    { eyebrow: 'Capability', title: 'Data & Analytics', description: 'Trusted data foundations for confident decisions.', url: '/capabilities/data-analytics' },
    { eyebrow: 'Capability', title: 'AI & Agent Development', description: 'Intelligent systems that act on enterprise context.', url: '/capabilities/ai-agent-development' },
  ],
}

const contactCta = { heading: 'Ready to talk?', sub: 'Tell us about your goals and we will shape the right path together.', label: 'Talk to Qlugen', url: '/contact' }

export const pageTemplates = [
  {
    key: 'standard-page',
    name: 'Standard Page',
    description: 'Banner, introduction, cards and a call to action.',
    group: 'Pages',
    contentType: 'standardPage',
    requiredFields: ['hero.title'],
    defaultContent: {
      hero: {
        eyebrow: 'Qlugen',
        title: 'New page',
        description: 'Introduce what this page is about in one or two sentences.',
        image: heroImage,
        imageAlt: '',
        cta: { label: 'Talk to an Architect', url: '/contact' },
      },
      intro: {
        eyebrow: 'Overview',
        title: 'What this page covers',
        body: 'Explain the problem, the Qlugen approach and the outcome a reader can expect.',
      },
      cards: {
        eyebrow: 'Highlights',
        title: 'Why it matters',
        items: [
          { title: 'First point', description: 'Describe the first key point.' },
          { title: 'Second point', description: 'Describe the second key point.' },
          { title: 'Third point', description: 'Describe the third key point.' },
        ],
      },
      cta: contactCta,
      seo: { title: 'New page | Qlugen', description: 'A Qlugen page.', ogImage },
    },
  },
  {
    key: 'product-detail',
    name: 'Product / Solution',
    description: 'The Qlugen product page design: outcomes, delivery flow, engagement model and capabilities.',
    group: 'Products & Platforms',
    contentType: 'productDetail',
    requiredFields: ['title', 'hero.title'],
    defaultContent: {
      slug: 'new-product',
      title: 'New Product',
      hero: {
        eyebrow: 'Product / Solution',
        title: 'New Product',
        description: 'Describe the product or solution and the enterprise problem it solves.',
        image: heroImage,
        imageAlt: '',
        cta: { label: 'Discuss with an Architect', url: '/contact' },
      },
      outcome: {
        eyebrow: 'Core outcome',
        title: 'What this helps teams achieve',
        items: [
          { title: 'Move faster', description: 'Start from a proven foundation instead of a blank page.' },
          { title: 'Reduce risk', description: 'Apply delivery patterns proven across enterprise programmes.' },
        ],
      },
      deliveryFlow: {
        eyebrow: 'Delivery flow',
        title: 'From current state to operating improvement',
        body: 'Explain how the solution is assessed, delivered and operated.',
        phaseLabel: 'Phase',
        steps: [
          { label: 'Assess', description: 'Clarify goals, systems and constraints.' },
          { label: 'Build', description: 'Configure and engineer the right solution.' },
          { label: 'Operate', description: 'Measure, improve and support production use.' },
        ],
      },
      engagementModel: {
        eyebrow: 'Engagement model',
        title: 'Products plus consulting, engineering and managed operations.',
        services: ['Discovery', 'Architecture', 'Engineering', 'Managed operations'],
      },
      operations: {
        eyebrow: 'Operations',
        title: 'Designed for production operations',
        body: 'Describe how the solution is governed, supported and improved.',
        items: [{ title: 'Operational visibility', description: 'Track outcomes and improvement opportunities.' }],
      },
      coreCapabilities: {
        eyebrow: 'Core capabilities',
        title: 'What the product covers',
        items: [{ title: 'Core capability', description: 'Describe a core capability.' }],
      },
      related: { heading: 'Related products', items: [] },
      cta: { heading: 'Start a product conversation', sub: 'Discuss the right solution path with our architects.', label: 'Start a Discovery', url: '/contact' },
      seo: { title: 'New Product | Qlugen', description: 'A Qlugen product or solution.', ogImage },
    },
  },
  {
    key: 'capability-detail',
    name: 'Capability',
    description: 'The Qlugen capability page design: challenge, impact, services and outcomes.',
    group: 'Capabilities',
    contentType: 'capabilityDetail',
    requiredFields: ['hero.title'],
    defaultContent: {
      hero: {
        eyebrow: 'Capability',
        title: 'New capability',
        description: 'Summarise the capability and the value it creates for the enterprise.',
        image: heroImage,
        imageAlt: '',
        visualImage,
        visualImageAlt: '',
      },
      challenge: {
        eyebrow: 'The challenge',
        title: 'The problem this capability solves',
        body: 'Describe the challenge enterprises face and why it matters now.',
      },
      impact: {
        eyebrow: 'Impact',
        title: 'Where this makes a difference',
        items: [
          { title: 'First impact', description: 'Describe the first area of impact.' },
          { title: 'Second impact', description: 'Describe the second area of impact.' },
        ],
      },
      services: {
        eyebrow: 'What we deliver',
        title: 'Our services',
        items: [
          { title: 'Strategy', description: 'Define the target state and roadmap.' },
          { title: 'Delivery', description: 'Engineer and implement the solution.' },
        ],
      },
      outcomes: {
        eyebrow: 'Outcomes',
        title: 'What this capability enables',
        items: [
          { value: '2x', title: 'Faster delivery', description: 'Describe the measurable outcome.' },
          { value: '100%', title: 'Visibility', description: 'Describe the measurable outcome.' },
        ],
      },
      related: relatedCapabilities,
      cta: contactCta,
      seo: { title: 'New capability | Qlugen', description: 'A Qlugen capability.', ogImage },
    },
  },
  {
    key: 'industry-detail',
    name: 'Industry',
    description: 'The Qlugen industry page design: challenge, where we help, priorities and outcomes.',
    group: 'Industries',
    contentType: 'industryDetail',
    requiredFields: ['hero.title'],
    defaultContent: {
      hero: {
        eyebrow: 'Industry',
        title: 'New industry',
        description: 'Summarise how Qlugen helps organisations in this industry.',
        image: heroImage,
        imageAlt: '',
        priorities: ['Modernise', 'Automate', 'Secure', 'Grow'],
      },
      challenge: {
        eyebrow: 'The challenge',
        title: 'What this industry is facing',
        body: 'Describe the pressures and opportunities in this industry.',
      },
      help: {
        eyebrow: 'Where we help',
        title: 'Focused on what moves the business',
        areas: ['Data & Analytics', 'Cloud Modernisation', 'Cybersecurity'],
      },
      priorities: {
        eyebrow: 'Technology priorities',
        title: 'What leaders focus on',
        items: [
          { title: 'First priority', description: 'Describe the first priority.' },
          { title: 'Second priority', description: 'Describe the second priority.' },
        ],
      },
      outcomes: {
        eyebrow: 'Business priorities',
        title: 'Outcomes that matter',
        items: [{ title: 'First outcome' }, { title: 'Second outcome' }],
      },
      related: relatedCapabilities,
      cta: contactCta,
      seo: { title: 'New industry | Qlugen', description: 'A Qlugen industry page.', ogImage },
    },
  },
  {
    key: 'insight-article',
    name: 'Insight / Article',
    description: 'The Qlugen article design: title, banner, article text and a closing call to action.',
    group: 'Insights',
    contentType: 'insightArticle',
    requiredFields: ['title'],
    defaultContent: {
      slug: 'new-article',
      title: 'New article',
      category: 'Insight',
      subtitle: 'Summarise the article in one sentence.',
      dateLabel: 'Qlugen insight',
      readTime: '5 min read',
      heroImage,
      body: [
        { type: 'heading', text: 'Start with the problem' },
        { type: 'paragraph', text: 'Write the article here. Add paragraphs, headings and quotes as separate blocks.' },
      ],
      endCta: { text: 'Want to discuss this topic?', label: 'Talk to Qlugen', url: '/contact' },
      seo: { title: 'New article | Qlugen', description: 'A Qlugen insight article.', ogImage },
    },
  },
]

const templatesByKey = new Map(pageTemplates.map(template => [template.key, template]))

export function getTemplate(key) {
  return templatesByKey.get(key) || null
}

export function isTemplateKey(key) {
  return templatesByKey.has(key)
}

// Friendly list for the admin (no internal content types or schemas).
export function listTemplates() {
  return pageTemplates.map(({ key, name, description }) => ({ key, name, description }))
}

export function templateContentTypes() {
  return pageTemplates.map(template => template.contentType)
}

// Initial draft for a new page: the template defaults personalised with the page name and slug.
export function initialContent(template, { title, slug }) {
  const content = clone(template.defaultContent)
  if ('slug' in content) content.slug = slug
  if ('title' in content) content.title = title
  if (content.hero && 'title' in content.hero) content.hero.title = title
  if (content.seo) content.seo.title = `${title} | Qlugen`
  return content
}

// Errors for content that does not match the template schema (unknown/missing fields, wrong
// field types, empty required fields). An empty array means the content is valid.
export function templateContentErrors(template, content) {
  const errors = []
  checkShape(template.defaultContent, content, [], errors)
  for (const path of template.requiredFields) {
    const value = path.split('.').reduce((current, key) => current?.[key], content)
    if (typeof value !== 'string' || !value.trim()) errors.push(`${path} is required`)
  }
  return errors
}

function checkShape(shape, value, path, errors) {
  const at = path.join('.') || 'content'
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) {
      errors.push(`${at} must be a list`)
      return
    }
    const itemShape = shape.length ? shape[0] : '' // an empty default list is a list of text
    value.forEach((item, index) => checkShape(itemShape, item, [...path, index], errors))
    return
  }
  if (shape && typeof shape === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${at} must be a group of fields`)
      return
    }
    for (const key of Object.keys(value)) {
      if (!(key in shape)) errors.push(`${[...path, key].join('.')} is not a field of this template`)
    }
    for (const [key, child] of Object.entries(shape)) {
      if (!(key in value)) errors.push(`${[...path, key].join('.')} is missing`)
      else checkShape(child, value[key], [...path, key], errors)
    }
    return
  }
  if (typeof shape === 'string' && isImageKey(String(path.at(-1))) && isMediaRef(value)) return
  if (typeof value !== typeof shape) errors.push(`${at} must be ${typeof shape === 'string' ? 'text' : typeof shape}`)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}
