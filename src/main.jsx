import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import SeoMetadata from './components/SeoMetadata'
import { cmsContent, cmsRuntimeEnabled, loadPublishedContent } from './cms/runtime'

const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
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

// Products and insight articles are resolved per slug inside their data helpers
// (src/data/productContent.js, src/lib/insights.js); global navigation/footer inside Layout.
const renderApp = () => createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SeoMetadata />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home content={cmsContent('home')} />} />
          <Route path="/capabilities" element={<CapabilitiesOverview content={cmsContent('capabilities-overview')} />} />
          <Route path="/capabilities/data-analytics" element={<DataAnalytics content={cmsContent('capability-data-analytics')} />} />
          <Route path="/capabilities/ai-agent-development" element={<AIAgentDev content={cmsContent('capability-ai-agent-development')} />} />
          <Route path="/capabilities/cloud-infrastructure" element={<CloudInfra content={cmsContent('capability-cloud-infrastructure')} />} />
          <Route path="/capabilities/cybersecurity" element={<Cybersecurity content={cmsContent('capability-cybersecurity')} />} />
          <Route path="/capabilities/automation" element={<Automation content={cmsContent('capability-automation')} />} />
          <Route path="/capabilities/digital-transformation" element={<DigitalTransformation content={cmsContent('capability-digital-transformation')} />} />
          <Route path="/capabilities/sustainability" element={<Sustainability content={cmsContent('capability-sustainability')} />} />
          <Route path="/products" element={<ProductsOverview />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/industries" element={<IndustriesOverview content={cmsContent('industries-overview')} />} />
          <Route path="/industries/financial-services" element={<FinancialServices content={cmsContent('industry-financial-services')} />} />
          <Route path="/industries/healthcare" element={<Healthcare content={cmsContent('industry-healthcare')} />} />
          <Route path="/industries/retail-commerce" element={<RetailCommerce content={cmsContent('industry-retail-commerce')} />} />
          <Route path="/industries/manufacturing" element={<Manufacturing content={cmsContent('industry-manufacturing')} />} />
          <Route path="/industries/government" element={<Government content={cmsContent('industry-government')} />} />
          <Route path="/industries/energy-utilities" element={<EnergyUtilities content={cmsContent('industry-energy-utilities')} />} />
          <Route path="/agentic-ai" element={<AgenticOverview content={cmsContent('agentic-overview')} />} />
          <Route path="/agentic-ai/orchestrate" element={<Orchestrate content={cmsContent('agentic-orchestrate')} />} />
          <Route path="/agentic-ai/build-run" element={<BuildRun content={cmsContent('agentic-build-run')} />} />
          <Route path="/agentic-ai/discover" element={<Discover content={cmsContent('agentic-discover')} />} />
          <Route path="/agentic-ai/govern" element={<Govern content={cmsContent('agentic-govern')} />} />
          <Route path="/agentic-ai/scale" element={<Scale content={cmsContent('agentic-scale')} />} />
          <Route path="/how-we-work" element={<HowWeWork content={cmsContent('how-we-work')} />} />
          <Route path="/technology" element={<Technology content={cmsContent('technology')} />} />
          <Route path="/insights" element={<InsightsOverview content={cmsContent('insights-overview')} />} />
          <Route path="/insights/:slug" element={<InsightArticle />} />
          <Route path="/company" element={<Company content={cmsContent('company-overview')} />} />
          <Route path="/about" element={<About content={cmsContent('company-about')} />} />
          <Route path="/leadership" element={<Leadership content={cmsContent('company-leadership')} />} />
          <Route path="/careers" element={<Careers content={cmsContent('company-careers')} />} />
          <Route path="/contact" element={<Contact content={cmsContent('contact')} />} />
          <Route path="/privacy" element={<Privacy content={cmsContent('legal-privacy')} />} />
          <Route path="/terms" element={<Terms content={cmsContent('legal-terms')} />} />
          <Route path="/cookies" element={<Cookies content={cmsContent('legal-cookies')} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound content={cmsContent('global-not-found')} />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
)

if (cmsRuntimeEnabled) {
  loadPublishedContent().finally(renderApp)
} else {
  renderApp()
}
