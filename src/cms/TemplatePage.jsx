import FinancialServices from '../pages/industries/FinancialServices'
import InsightArticle from '../pages/insights/InsightArticle'
import ProductDetail from '../pages/products/ProductDetail'
import Sustainability from '../pages/capabilities/Sustainability'
import StandardPage from './templates/StandardPage'

// Binds each approved template (src/cms/templateRegistry.js) to the code-controlled React design
// that renders it. Capability, Industry, Product and Insight pages reuse the existing Qlugen page
// designs, so a CMS-created page looks exactly like the hand-built pages of that kind.
const templateComponents = {
  'standard-page': StandardPage,
  'product-detail': ProductDetail,
  'capability-detail': Sustainability,
  'industry-detail': FinancialServices,
  'insight-article': InsightArticle,
}

export default function TemplatePage({ templateKey, content, cmsEditMode = false }) {
  const Component = templateComponents[templateKey]
  return Component ? <Component content={content} cmsEditMode={cmsEditMode || undefined} /> : null
}
