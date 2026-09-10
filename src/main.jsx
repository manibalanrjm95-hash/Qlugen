import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import SeoMetadata from './components/SeoMetadata'

import Home from './pages/Home'
import NotFound from './pages/NotFound'
import CapabilitiesOverview from './pages/capabilities/CapabilitiesOverview'
import DataAnalytics from './pages/capabilities/DataAnalytics'
import AIAgentDev from './pages/capabilities/AIAgentDev'
import CloudInfra from './pages/capabilities/CloudInfra'
import Cybersecurity from './pages/capabilities/Cybersecurity'
import Automation from './pages/capabilities/Automation'
import DigitalTransformation from './pages/capabilities/DigitalTransformation'
import Sustainability from './pages/capabilities/Sustainability'
import IndustriesOverview from './pages/industries/IndustriesOverview'
import FinancialServices from './pages/industries/FinancialServices'
import Healthcare from './pages/industries/Healthcare'
import RetailCommerce from './pages/industries/RetailCommerce'
import Manufacturing from './pages/industries/Manufacturing'
import Government from './pages/industries/Government'
import EnergyUtilities from './pages/industries/EnergyUtilities'
import AgenticOverview from './pages/agentic/AgenticOverview'
import Orchestrate from './pages/agentic/Orchestrate'
import BuildRun from './pages/agentic/BuildRun'
import Discover from './pages/agentic/Discover'
import Govern from './pages/agentic/Govern'
import Scale from './pages/agentic/Scale'
import HowWeWork from './pages/HowWeWork'
import Technology from './pages/Technology'
import InsightsOverview from './pages/insights/InsightsOverview'
import AIPilotsArticle from './pages/insights/AIPilotsArticle'
import ModerniseArticle from './pages/insights/ModerniseArticle'
import AgenticOperatingModel from './pages/insights/AgenticOperatingModel'
import Company from './pages/company/Company'
import About from './pages/company/About'
import Leadership from './pages/company/Leadership'
import Careers from './pages/company/Careers'
import Contact from './pages/company/Contact'
import Privacy from './pages/legal/Privacy'
import Terms from './pages/legal/Terms'
import Cookies from './pages/legal/Cookies'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SeoMetadata />
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
    </BrowserRouter>
  </StrictMode>
)
