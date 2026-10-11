// Editor-facing names for content keys. Content structure is unchanged; this only affects labels.
import { friendlyLabel } from './contentEditor'

const LABELS = {
  titleLines: 'Main Heading',
  descriptionBeforeLink: 'Description',
  descriptionLinkLabel: 'Description Link Text',
  descriptionLinkUrl: 'Description Link URL',
  descriptionAfterLink: 'Description (continued after link)',
  bottomTextBeforeAccent: 'Bottom Text',
  bottomTextAccent: 'Bottom Text Highlight',
  ctaText: 'Button Text',
  ctaLabel: 'Button Text',
  ctaUrl: 'Button Link',
  cta: 'Call to Action',
  endCta: 'Closing Call to Action',
  linkLabel: 'Link Text',
  linkUrl: 'Link URL',
  url: 'Link URL',
  primaryLink: 'Primary Button',
  secondaryLink: 'Secondary Button',
  label: 'Label',
  eyebrow: 'Small Label Above Heading',
  desc: 'Description',
  sub: 'Subheading',
  bio: 'Biography',
  seo: 'SEO',
  agenticAi: 'Agentic AI',
  ogImage: 'Social Share Image',
  ogImageAlt: 'Social Share Image Alt Text',
  defaultOgImage: 'Default Social Share Image',
  heroImage: 'Hero Image',
  portrait: 'Portrait Photo',
  visualImage: 'Visual Image',
  statValue: 'Statistic',
  statLabel: 'Statistic Label',
  mapEmbedUrl: 'Map Embed URL',
  mapLinkUrl: 'Map Link URL',
  mapLinkLabel: 'Map Link Text',
  dateLabel: 'Date Shown on Page',
  publishedDate: 'Published Date',
  type: 'Block Type',
  body: 'Body Text',
  paragraphs: 'Paragraphs',
  linkedinUrl: 'LinkedIn URL',
  linkedinLabel: 'LinkedIn Link Text',
}

const ITEM_NAMES = {
  body: 'Block',
  children: 'Link',
  experience: 'Company',
  openRoles: 'Role',
  stats: 'Statistic',
  categories: 'Category',
}

const ITEM_TITLE_KEYS = ['title', 'name', 'label', 'heading', 'text', 'role', 'question', 'eyebrow', 'value']

// Arrays that only exist to create visual line breaks. Edited as one text box, saved as the original array.
export const LINE_ARRAYS = {
  titleLines: { separator: '\n', hint: 'Each line of text appears on its own line on the page.' },
  paragraphs: { separator: '\n\n', hint: 'Leave a blank line between paragraphs.' },
}

export const BLOCK_TYPES = ['paragraph', 'heading', 'quote', 'divider']

// Labels that depend on the surrounding group, e.g. seo.title -> "SEO Title", hero.image -> "Banner Image".
// The page's top-level group is keyed by '' (so a page's own `title` reads "Page Title").
const CONTEXT_LABELS = {
  '': { title: 'Page Title' },
  seo: { title: 'SEO Title', description: 'Meta Description', ogImage: 'Social Share Image', ogImageAlt: 'Social Share Image Alt Text', breadcrumbLabel: 'Breadcrumb Label' },
  hero: { title: 'Hero Heading', image: 'Banner Image', cta: 'Button' },
  cta: { heading: 'Heading', sub: 'Supporting Text', label: 'Button Text', url: 'Button Link' },
  endCta: { text: 'Heading', label: 'Button Text', url: 'Button Link' },
  primaryLink: { label: 'Button Text', url: 'Button Link' },
  secondaryLink: { label: 'Button Text', url: 'Button Link' },
}

export function labelFor(key, parentKey) {
  if (typeof key === 'number') return `Item ${key + 1}`
  const contextual = parentKey !== undefined && CONTEXT_LABELS[parentKey]?.[key]
  if (contextual) return contextual
  if (LABELS[key]) return LABELS[key]
  return friendlyLabel(key)
    .replace(/\bUrl\b/g, 'URL')
    .replace(/\bCta\b/g, 'Button')
    .replace(/\bSeo\b/g, 'SEO')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bOg\b/g, 'Social Share')
    .replace(/\bAria Label\b/g, '(Screen Reader Label)')
    .replace(/\bAlt$/, 'Alt Text')
}

// Name for one entry of a list: "Card" for cards.items, "Step" for steps, ...
export function itemNameFor(listKey, parentKey) {
  if (ITEM_NAMES[listKey]) return ITEM_NAMES[listKey]
  if (listKey === 'items' && typeof parentKey === 'string' && parentKey) return itemNameFor(parentKey)
  const label = labelFor(listKey)
  if (/ies$/.test(label)) return label.replace(/ies$/, 'y')
  if (/(ss|us)$/.test(label)) return label
  return label.replace(/s$/, '')
}

export function itemTitle(item) {
  if (typeof item === 'string') return item
  if (!item || typeof item !== 'object') return ''
  for (const key of ITEM_TITLE_KEYS) {
    if (typeof item[key] === 'string' && item[key].trim()) return item[key].trim()
  }
  return ''
}

export function isLineArray(key, value) {
  return Boolean(LINE_ARRAYS[key]) && Array.isArray(value) && value.every(line => typeof line === 'string')
}
