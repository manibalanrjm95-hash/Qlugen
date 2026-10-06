import productsOverviewContent from '../content/products/overview.json'

const productDetailModules = import.meta.glob('../content/products/details/*.json', {
  eager: true,
  import: 'default',
})

const products = Object.values(productDetailModules)
const productMap = Object.fromEntries(products.map(product => [product.slug, product]))

const fallbackImage = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1800&q=80'
const fallbackSeoImage = '/social/qlugen.png'

const isString = value => typeof value === 'string' && value.trim().length > 0
const text = (value, fallback = '') => (isString(value) ? value : fallback)
const list = value => (Array.isArray(value) ? value : [])

function validateProduct(raw) {
  if (!raw) return null

  const slug = text(raw.slug, 'product')
  const name = text(raw.title, text(raw.hero?.title, 'Product'))
  const maturityLabel = text(raw.hero?.eyebrow, 'Product')
  const heroDescription = text(raw.hero?.description, '')
  const outcomeItems = list(raw.outcome?.items)
  const coreCapabilityItems = list(raw.coreCapabilities?.items)
  const services = list(raw.engagementModel?.services).filter(isString)

  return {
    slug,
    name,
    type: maturityLabel,
    maturityLabel,
    short: heroDescription,
    hero: {
      eyebrow: text(raw.hero?.eyebrow, maturityLabel),
      title: text(raw.hero?.title, name),
      description: heroDescription,
      image: text(raw.hero?.image, fallbackImage),
      imageAlt: text(raw.hero?.imageAlt, ''),
    },
    heroCta: {
      label: text(raw.hero?.cta?.label, 'Discuss with an Architect'),
      url: text(raw.hero?.cta?.url, '/contact'),
    },
    outcome: {
      eyebrow: text(raw.outcome?.eyebrow, 'Core outcome'),
      title: text(raw.outcome?.title, 'A measurable enterprise outcome.'),
      items: outcomeItems.map((item, index) => ({
        title: text(item?.title, `Capability ${index + 1}`),
        description: text(item?.description, ''),
      })),
    },
    deliveryFlow: {
      eyebrow: text(raw.deliveryFlow?.eyebrow, 'Delivery flow'),
      title: text(raw.deliveryFlow?.title, 'From current state to operating improvement'),
      body: text(raw.deliveryFlow?.body, ''),
      phaseLabel: text(raw.deliveryFlow?.phaseLabel, 'Phase'),
      steps: list(raw.deliveryFlow?.steps).map(step => ({
        label: text(step?.label, ''),
        description: text(step?.description, text(step?.desc, '')),
      })),
    },
    engagementModel: {
      eyebrow: text(raw.engagementModel?.eyebrow, 'Engagement model'),
      title: text(raw.engagementModel?.title, 'Products plus consulting, engineering and managed operations.'),
      services,
    },
    operations: {
      eyebrow: text(raw.operations?.eyebrow, 'Operations'),
      title: text(raw.operations?.title, 'Designed for production operations'),
      body: text(raw.operations?.body, ''),
      items: list(raw.operations?.items).map(item => ({
        title: text(item?.title, ''),
        description: text(item?.description, ''),
      })),
    },
    coreCapabilities: {
      eyebrow: text(raw.coreCapabilities?.eyebrow, 'Core capabilities'),
      title: text(raw.coreCapabilities?.title, 'What the product covers'),
      items: coreCapabilityItems.map((item, index) => ({
        title: text(item?.title, `Capability ${index + 1}`),
        description: text(item?.description, ''),
      })),
    },
    related: {
      heading: text(raw.related?.heading, 'Related products'),
      items: list(raw.related?.items).filter(isString),
    },
    cta: {
      heading: text(raw.cta?.heading, `Start an ${name} conversation`),
      sub: text(raw.cta?.sub, ''),
      label: text(raw.cta?.label, 'Start a Discovery'),
      url: text(raw.cta?.url, '/contact'),
    },
    seo: {
      title: text(raw.seo?.title, `${name} | Qlugen`),
      description: text(raw.seo?.description, heroDescription),
      ogImage: text(raw.seo?.ogImage, fallbackSeoImage),
    },
  }
}

function validateOverview(raw, productItems) {
  const hero = raw?.hero || {}
  const portfolio = raw?.portfolio || {}
  const model = raw?.model || {}
  const cta = raw?.cta || {}

  return {
    hero: {
      image: text(hero.image, fallbackImage),
      imageAlt: text(hero.imageAlt, ''),
      eyebrow: text(hero.eyebrow, 'Products & Platforms'),
      title: text(hero.title, 'Reusable technology for repeated enterprise problems.'),
      description: text(hero.description, ''),
    },
    portfolio: {
      eyebrow: text(portfolio.eyebrow, 'Portfolio'),
      title: text(portfolio.title, 'Product-led engineering across Data, AI, Cloud and Analytics'),
      body: text(portfolio.body, ''),
      products: productItems,
    },
    model: {
      eyebrow: text(model.eyebrow, 'Qlugen model'),
      title: text(model.title, 'Product thinking. Engineering depth. Enterprise impact.'),
      body: text(model.body, ''),
      steps: list(model.steps).map(step => ({
        label: text(step?.label, ''),
        desc: text(step?.desc, ''),
      })).filter(step => step.label || step.desc),
    },
    cta: {
      heading: text(cta.heading, 'Have a transformation problem worth productising?'),
      sub: text(cta.sub, ''),
      label: text(cta.label, 'Talk to an Architect'),
      url: text(cta.url, '/contact'),
    },
    seo: {
      title: text(raw?.seo?.title, 'Products & Platforms | Qlugen'),
      description: text(raw?.seo?.description, ''),
      ogImage: text(raw?.seo?.ogImage, fallbackSeoImage),
    },
  }
}

export function getValidatedProducts() {
  return products.map(validateProduct).filter(Boolean)
}

export function getValidatedProductMap() {
  return Object.fromEntries(getValidatedProducts().map(product => [product.slug, product]))
}

export function getValidatedProduct(slug) {
  return validateProduct(productMap[slug])
}

export function getValidatedProductsOverview() {
  return validateOverview(productsOverviewContent, getValidatedProducts())
}
