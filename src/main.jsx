import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import SeoMetadata from './components/SeoMetadata'

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
const AIPilotsArticle = lazy(() => import('./pages/insights/AIPilotsArticle'))
const ModerniseArticle = lazy(() => import('./pages/insights/ModerniseArticle'))
const AgenticOperatingModel = lazy(() => import('./pages/insights/AgenticOperatingModel'))
const Company = lazy(() => import('./pages/company/Company'))
const About = lazy(() => import('./pages/company/About'))
const Leadership = lazy(() => import('./pages/company/Leadership'))
const Careers = lazy(() => import('./pages/company/Careers'))
const Contact = lazy(() => import('./pages/company/Contact'))
const Privacy = lazy(() => import('./pages/legal/Privacy'))
const Terms = lazy(() => import('./pages/legal/Terms'))
const Cookies = lazy(() => import('./pages/legal/Cookies'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SeoMetadata />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/capabilities" element={<CapabilitiesOverview />} />
          <Route path="/capabilities/data-analytics" element={<DataAnalytics />} />
          <Route path="/capabilities/ai-agent-development" element={<AIAgentDev />} />
          <Route path="/capabilities/cloud-infrastructure" element={<CloudInfra />} />
          <Route path="/capabilities/cybersecurity" element={<Cybersecurity />} />
          <Route path="/capabilities/automation" element={<Automation />} />
          <Route path="/capabilities/digital-transformation" element={<DigitalTransformation />} />
          <Route path="/capabilities/sustainability" element={<Sustainability />} />
          <Route path="/industries" element={<IndustriesOverview />} />
          <Route path="/industries/financial-services" element={<FinancialServices />} />
          <Route path="/industries/healthcare" element={<Healthcare />} />
          <Route path="/industries/retail-commerce" element={<RetailCommerce />} />
          <Route path="/industries/manufacturing" element={<Manufacturing />} />
          <Route path="/industries/government" element={<Government />} />
          <Route path="/industries/energy-utilities" element={<EnergyUtilities />} />
          <Route path="/agentic-ai" element={<AgenticOverview />} />
          <Route path="/agentic-ai/orchestrate" element={<Orchestrate />} />
          <Route path="/agentic-ai/build-run" element={<BuildRun />} />
          <Route path="/agentic-ai/discover" element={<Discover />} />
          <Route path="/agentic-ai/govern" element={<Govern />} />
          <Route path="/agentic-ai/scale" element={<Scale />} />
          <Route path="/how-we-work" element={<HowWeWork />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/insights" element={<InsightsOverview />} />
          <Route path="/insights/ai-pilots-to-enterprise-impact" element={<AIPilotsArticle />} />
          <Route path="/insights/modernise-without-slowing-business" element={<ModerniseArticle />} />
          <Route path="/insights/agentic-enterprise-operating-model" element={<AgenticOperatingModel />} />
          <Route path="/company" element={<Company />} />
          <Route path="/about" element={<About />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
)
