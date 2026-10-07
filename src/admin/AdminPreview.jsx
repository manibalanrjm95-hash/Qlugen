import { useMemo } from 'react'
import { normalizeMediaContent } from '../lib/media'
import { mediaSrc } from './cmsApi'
import Home from '../pages/Home'
import NotFound from '../pages/NotFound'
import HowWeWork from '../pages/HowWeWork'
import Technology from '../pages/Technology'
import AgenticOverview from '../pages/agentic/AgenticOverview'
import BuildRun from '../pages/agentic/BuildRun'
import Discover from '../pages/agentic/Discover'
import Govern from '../pages/agentic/Govern'
import Orchestrate from '../pages/agentic/Orchestrate'
import Scale from '../pages/agentic/Scale'
import AIAgentDev from '../pages/capabilities/AIAgentDev'
import Automation from '../pages/capabilities/Automation'
import CapabilitiesOverview from '../pages/capabilities/CapabilitiesOverview'
import CloudInfra from '../pages/capabilities/CloudInfra'
import Cybersecurity from '../pages/capabilities/Cybersecurity'
import DataAnalytics from '../pages/capabilities/DataAnalytics'
import DigitalTransformation from '../pages/capabilities/DigitalTransformation'
import Sustainability from '../pages/capabilities/Sustainability'
import About from '../pages/company/About'
import Careers from '../pages/company/Careers'
import Company from '../pages/company/Company'
import Contact from '../pages/company/Contact'
import Leadership from '../pages/company/Leadership'
import EnergyUtilities from '../pages/industries/EnergyUtilities'
import FinancialServices from '../pages/industries/FinancialServices'
import Government from '../pages/industries/Government'
import Healthcare from '../pages/industries/Healthcare'
import IndustriesOverview from '../pages/industries/IndustriesOverview'
import Manufacturing from '../pages/industries/Manufacturing'
import RetailCommerce from '../pages/industries/RetailCommerce'
import InsightArticle from '../pages/insights/InsightArticle'
import InsightsOverview from '../pages/insights/InsightsOverview'
import Cookies from '../pages/legal/Cookies'
import Privacy from '../pages/legal/Privacy'
import Terms from '../pages/legal/Terms'
import ProductDetail from '../pages/products/ProductDetail'
import ProductsOverview from '../pages/products/ProductsOverview'

export const previewAdapters = {
  'agentic-build-run': BuildRun,
  'agentic-discover': Discover,
  'agentic-govern': Govern,
  'agentic-orchestrate': Orchestrate,
  'agentic-overview': AgenticOverview,
  'agentic-scale': Scale,
  'capabilities-overview': CapabilitiesOverview,
  'capability-ai-agent-development': AIAgentDev,
  'capability-automation': Automation,
  'capability-cloud-infrastructure': CloudInfra,
  'capability-cybersecurity': Cybersecurity,
  'capability-data-analytics': DataAnalytics,
  'capability-digital-transformation': DigitalTransformation,
  'capability-sustainability': Sustainability,
  'company-about': About,
  'company-careers': Careers,
  'company-leadership': Leadership,
  'company-overview': Company,
  contact: Contact,
  'global-not-found': NotFound,
  home: Home,
  'how-we-work': HowWeWork,
  'industries-overview': IndustriesOverview,
  'industry-energy-utilities': EnergyUtilities,
  'industry-financial-services': FinancialServices,
  'industry-government': Government,
  'industry-healthcare': Healthcare,
  'industry-manufacturing': Manufacturing,
  'industry-retail-commerce': RetailCommerce,
  'insight-agentic-enterprise-operating-model': InsightArticle,
  'insight-ai-pilots-to-enterprise-impact': InsightArticle,
  'insight-modernise-without-slowing-business': InsightArticle,
  'insights-overview': InsightsOverview,
  'legal-cookies': Cookies,
  'legal-privacy': Privacy,
  'legal-terms': Terms,
  'product-ai-governance': ProductDetail,
  'product-ai-readiness-assessment': ProductDetail,
  'product-analytics-migration-factory': ProductDetail,
  'product-cloud-optimize': ProductDetail,
  'product-data-agent-platform': ProductDetail,
  'product-data-governance': ProductDetail,
  'product-data-migration-factory': ProductDetail,
  'product-qlugen-context': ProductDetail,
  'products-overview': ProductsOverview,
  technology: Technology,
}

export const structuredPreviewIds = ['global-navigation', 'global-footer', 'global-seo']
export const realPreviewRecordIds = Object.keys(previewAdapters)

export default function AdminPreview({ page, content }) {
  // Draft image fields may hold media references; public components expect URL strings.
  const previewContent = useMemo(
    () => (content ? normalizeMediaContent(content, { resolveUrl: mediaSrc }) : content),
    [content],
  )

  return (
    <div className="cms-admin__preview-frame">
      {renderPreview(page, previewContent)}
    </div>
  )
}

function renderPreview(page, content) {
  if (!page || !content) return <PreviewMessage title="No page selected" />

  const Component = previewAdapters[page.id]
  if (Component) return <Component content={content} />

  if (page.id === 'global-navigation') return <GlobalNavigationPreview content={content} />
  if (page.id === 'global-footer') return <GlobalFooterPreview content={content} />
  if (page.id === 'global-seo') return <SeoPreview content={content} />

  return (
    <PreviewMessage
      title="No public route preview"
      body="This record is not rendered as a standalone public page."
    />
  )
}

function GlobalNavigationPreview({ content }) {
  return (
    <div className="cms-admin__structured-preview">
      <h2>{content.logoAlt || 'Navigation'}</h2>
      <p>{content.homeLabel}</p>
      <div className="cms-admin__structured-list">
        {(content.items || []).map(item => (
          <section key={item.label}>
            <h3>{item.label}</h3>
            <p>{item.url}</p>
            {(item.children || []).map(child => <span key={child.label}>{child.label}</span>)}
          </section>
        ))}
      </div>
      {content.cta && <a href={content.cta.url}>{content.cta.label}</a>}
    </div>
  )
}

function GlobalFooterPreview({ content }) {
  return (
    <div className="cms-admin__structured-preview">
      <h2>{content.brand?.name || 'Footer'}</h2>
      <p>{content.brand?.description}</p>
      <div className="cms-admin__structured-list">
        {(content.sections || []).map(section => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            {(section.links || []).map(link => <span key={link.label}>{link.label}</span>)}
          </section>
        ))}
      </div>
      <p>{content.legal}</p>
    </div>
  )
}

function SeoPreview({ content }) {
  return (
    <div className="cms-admin__structured-preview">
      <h2>{content.defaultTitle || 'SEO'}</h2>
      <p>{content.defaultDescription}</p>
      <div className="cms-admin__structured-list">
        {Object.entries(content.pages || {}).map(([key, value]) => (
          <section key={key}>
            <h3>{key}</h3>
            <p>{value.title}</p>
            <p>{value.description}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

function PreviewMessage({ title, body }) {
  return (
    <div className="cms-admin__preview-message">
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  )
}
