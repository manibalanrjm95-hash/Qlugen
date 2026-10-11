import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route } from 'react-router-dom'
import './index.css'
import SeoMetadata from './components/SeoMetadata'
import { cmsRuntimeEnabled, loadPublishedContentFor } from './cms/runtime'
import CmsPage from './cms/CmsPage'
import CmsRoutes from './cms/CmsRoutes'
import DynamicCmsPage from './cms/DynamicCmsPage'

const Home = lazy(() => import('./pages/Home'))
const CapabilitiesOverview = lazy(() => import('./pages/capabilities/CapabilitiesOverview'))
const DataAnalytics = lazy(() => import('./pages/capabilities/DataAnalytics'))
const AIAgentDev = lazy(() => import('./pages/capabilities/AIAgentDev'))
const CloudInfra = lazy(() => import('./pages/capabilities/CloudInfra'))
const Cybersecurity = lazy(() => import('./pages/capabilities/Cybersecurity'))
const Automation = lazy(() => import('./pages/capabilities/Automation'))
const DigitalTransformation = lazy(() => import('./pages/capabilities/DigitalTransformation'))
const Sustainability = lazy(() => import('./pages/capabilities/Sustainability'))
const ProductsOverview = lazy(() => import('./pages/products/ProductsOverview'))
const ProductDetail = lazy(() => import('./pages/products/ProductDetail'))
const IndustriesOverview = lazy(() => import('./pages/industries/IndustriesOverview'))
const FinancialServices = lazy(() => import('./pages/industries/FinancialServices'))
const Healthcare = lazy(() => import('./pages/industries/Healthcare'))
const RetailCommerce = lazy(() => import('./pages/industries/RetailCommerce'))
const Manufacturing = lazy(() => import('./pages/industries/Manufacturing'))
const Government = lazy(() => import('./pages/industries/Government'))
const EnergyUtilities = lazy(() => import('./pages/industries/EnergyUtilities'))
const AgenticOverview = lazy(() => import('./pages/agentic/AgenticOverview'))
const Orchestrate = lazy(() => import('./pages/agentic/Orchestrate'))
const BuildRun = lazy(() => import('./pages/agentic/BuildRun'))
const Discover = lazy(() => import('./pages/agentic/Discover'))
const Govern = lazy(() => import('./pages/agentic/Govern'))
const Scale = lazy(() => import('./pages/agentic/Scale'))
const HowWeWork = lazy(() => import('./pages/HowWeWork'))
const Technology = lazy(() => import('./pages/Technology'))
const InsightsOverview = lazy(() => import('./pages/insights/InsightsOverview'))
const InsightArticle = lazy(() => import('./pages/insights/InsightArticle'))
const Company = lazy(() => import('./pages/company/Company'))
const About = lazy(() => import('./pages/company/About'))
const Leadership = lazy(() => import('./pages/company/Leadership'))
const Careers = lazy(() => import('./pages/company/Careers'))
const Contact = lazy(() => import('./pages/company/Contact'))
const Privacy = lazy(() => import('./pages/legal/Privacy'))
const Terms = lazy(() => import('./pages/legal/Terms'))
const Cookies = lazy(() => import('./pages/legal/Cookies'))
const Admin = lazy(() => import('./admin/Admin'))
const LivePreview = lazy(() => import('./admin/LivePreview'))
const CmsReference = lazy(() => import('./admin/reference/CmsReference'))

// Products and insight articles are resolved per slug inside their data helpers
// (src/data/productContent.js, src/lib/insights.js); global navigation/footer inside Layout.
const renderApp = () => createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SeoMetadata />
      <Suspense fallback={null}>
        <CmsRoutes>
          <Route path="/" element={<CmsPage id="home" page={Home} />} />
          <Route path="/capabilities" element={<CmsPage id="capabilities-overview" page={CapabilitiesOverview} />} />
          <Route path="/capabilities/data-analytics" element={<CmsPage id="capability-data-analytics" page={DataAnalytics} />} />
          <Route path="/capabilities/ai-agent-development" element={<CmsPage id="capability-ai-agent-development" page={AIAgentDev} />} />
          <Route path="/capabilities/cloud-infrastructure" element={<CmsPage id="capability-cloud-infrastructure" page={CloudInfra} />} />
          <Route path="/capabilities/cybersecurity" element={<CmsPage id="capability-cybersecurity" page={Cybersecurity} />} />
          <Route path="/capabilities/automation" element={<CmsPage id="capability-automation" page={Automation} />} />
          <Route path="/capabilities/digital-transformation" element={<CmsPage id="capability-digital-transformation" page={DigitalTransformation} />} />
          <Route path="/capabilities/sustainability" element={<CmsPage id="capability-sustainability" page={Sustainability} />} />
          <Route path="/products" element={<ProductsOverview />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/industries" element={<CmsPage id="industries-overview" page={IndustriesOverview} />} />
          <Route path="/industries/financial-services" element={<CmsPage id="industry-financial-services" page={FinancialServices} />} />
          <Route path="/industries/healthcare" element={<CmsPage id="industry-healthcare" page={Healthcare} />} />
          <Route path="/industries/retail-commerce" element={<CmsPage id="industry-retail-commerce" page={RetailCommerce} />} />
          <Route path="/industries/manufacturing" element={<CmsPage id="industry-manufacturing" page={Manufacturing} />} />
          <Route path="/industries/government" element={<CmsPage id="industry-government" page={Government} />} />
          <Route path="/industries/energy-utilities" element={<CmsPage id="industry-energy-utilities" page={EnergyUtilities} />} />
          <Route path="/agentic-ai" element={<CmsPage id="agentic-overview" page={AgenticOverview} />} />
          <Route path="/agentic-ai/orchestrate" element={<CmsPage id="agentic-orchestrate" page={Orchestrate} />} />
          <Route path="/agentic-ai/build-run" element={<CmsPage id="agentic-build-run" page={BuildRun} />} />
          <Route path="/agentic-ai/discover" element={<CmsPage id="agentic-discover" page={Discover} />} />
          <Route path="/agentic-ai/govern" element={<CmsPage id="agentic-govern" page={Govern} />} />
          <Route path="/agentic-ai/scale" element={<CmsPage id="agentic-scale" page={Scale} />} />
          <Route path="/how-we-work" element={<CmsPage id="how-we-work" page={HowWeWork} />} />
          <Route path="/technology" element={<CmsPage id="technology" page={Technology} />} />
          <Route path="/insights" element={<CmsPage id="insights-overview" page={InsightsOverview} />} />
          <Route path="/insights/:slug" element={<InsightArticle />} />
          <Route path="/company" element={<CmsPage id="company-overview" page={Company} />} />
          <Route path="/about" element={<CmsPage id="company-about" page={About} />} />
          <Route path="/leadership" element={<CmsPage id="company-leadership" page={Leadership} />} />
          <Route path="/careers" element={<CmsPage id="company-careers" page={Careers} />} />
          <Route path="/contact" element={<CmsPage id="contact" page={Contact} />} />
          <Route path="/privacy" element={<CmsPage id="legal-privacy" page={Privacy} />} />
          <Route path="/terms" element={<CmsPage id="legal-terms" page={Terms} />} />
          <Route path="/cookies" element={<CmsPage id="legal-cookies" page={Cookies} />} />
          <Route path="/admin/ui-reference" element={<CmsReference />} />
          <Route path="/admin/live-preview" element={<LivePreview />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<DynamicCmsPage />} />
        </CmsRoutes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
)

if (cmsRuntimeEnabled) {
  loadPublishedContentFor(window.location.pathname).finally(renderApp)
} else {
  renderApp()
}
