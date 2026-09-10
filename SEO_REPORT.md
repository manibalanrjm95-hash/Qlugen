# Qlugen SEO Step 1

Status: prepared and validated; activation is pending confirmation of the production custom domain (including www preference).

All 36 public routes have unique titles and descriptions in src/seo/pages.js. The homepage uses the supplied title and description exactly. No visible content, design, layout, colours, typography or React routes were changed.

Each entry supplies the document title, description, canonical URL, Open Graph title/description/image/type/URL/site name, and Twitter large-image card/title/description/image. The shared social image is public/social/qlugen.png, a 1200 x 630 PNG made from the existing Qlugen logo assets.

src/seo/site.js intentionally has no origin until the custom domain is confirmed. Metadata is inactive in the production build; no guessed domain, Firebase domain or test origin is used there. The isolated browser test uses a test-only origin under .tmp/seo-check, outside the Firebase deployment directory.

Remaining activation: set the confirmed production origin, add exact Firebase rewrites from the existing routes to the generated route HTML files (preserving public URLs), rebuild, and verify served metadata against the confirmed domain. Deployment has not been performed.

Validation: node scripts/check-seo.mjs; node scripts/check-seo-browser.mjs. Passed route coverage, duplicate checks, all required tags, canonical handling, social PNG dimensions, unchanged HTML body, 36 browser route visits, client navigation, back/forward, query/hash handling and 404 recovery. Production build and changed-file lint checked separately.

## Pages prepared

| Existing route | Unique title | Meta description |
| --- | --- | --- |
| / | Qlugen \| Enterprise AI, Cloud & Digital Transformation | Qlugen helps enterprises modernise with AI, data, cloud, cybersecurity, automation and digital transformation services. |
| /capabilities | Enterprise Technology Capabilities \| Qlugen | Explore seven connected Qlugen capabilities, from data and AI to cloud, security, automation, digital transformation and sustainability. |
| /capabilities/data-analytics | Enterprise Data & Analytics \| Qlugen | Create trusted data foundations with Qlugen, giving enterprise teams faster access to reliable analytics and intelligence for better decisions. |
| /capabilities/ai-agent-development | Enterprise AI & Agent Development \| Qlugen | Move beyond AI experimentation with practical copilots, agents and intelligent workflows designed around your enterprise operations. |
| /capabilities/cloud-infrastructure | Cloud & Infrastructure Services \| Qlugen | Build resilient cloud and infrastructure foundations with Qlugen to support modern enterprise workloads, migration and growth at scale. |
| /capabilities/cybersecurity | Enterprise Cybersecurity Services \| Qlugen | Embed intelligence-led security across your enterprise, from identity and access to cloud protection and real-time threat detection. |
| /capabilities/automation | Enterprise Automation Services \| Qlugen | Connect systems, automate repetitive processes and orchestrate workflows with Qlugen, freeing your workforce for higher-value strategic work. |
| /capabilities/digital-transformation | Digital Transformation Services \| Qlugen | Design and deliver end-to-end transformation programmes that modernise operations and build digital capabilities, from strategy to adoption. |
| /capabilities/sustainability | Enterprise Sustainability Enablement \| Qlugen | Integrate sustainability into enterprise technology strategy with measurement, visibility and operational progress supported by Qlugen. |
| /industries | Industries We Serve \| Qlugen | Explore Qlugen technology services for financial services, healthcare, retail, manufacturing, government, and energy and utilities. |
| /industries/financial-services | Financial Services Technology \| Qlugen | Modernise financial operations with data, AI and cloud foundations that support performance, compliance and evolving customer expectations. |
| /industries/healthcare | Healthcare Technology Services \| Qlugen | Connect healthcare information and streamline operations with digital foundations that support clinicians, administrators and patients. |
| /industries/retail-commerce | Retail & Commerce Technology \| Qlugen | Connect customer experiences, supply chains and retail operations with the data and technology foundations needed to compete in commerce. |
| /industries/manufacturing | Manufacturing Technology Services \| Qlugen | Connect the factory floor to enterprise systems with data, AI and automation that improve manufacturing visibility, performance and resilience. |
| /industries/government | Government & Public Sector Technology \| Qlugen | Design and deliver public sector technology that improves services, connects information and builds digital capability around public outcomes. |
| /industries/energy-utilities | Energy & Utilities Technology \| Qlugen | Build data and technology foundations for reliable energy and utility operations, from asset intelligence to operational automation. |
| /agentic-ai | Enterprise Agentic AI \| Qlugen | Design, build and scale governed AI agent ecosystems that connect enterprise data, applications, workflows and human decisions. |
| /agentic-ai/orchestrate | Enterprise AI Agent Orchestration \| Qlugen | Connect AI agents, systems, tools, workflows and human approvals into coordinated enterprise processes with Qlugen. |
| /agentic-ai/build-run | Build & Run Enterprise AI Agents \| Qlugen | Engineer AI agents and systems that operate reliably inside your enterprise environment, with integration, evaluation and operational monitoring. |
| /agentic-ai/discover | AI Opportunity Discovery \| Qlugen | Identify and prioritise high-value AI opportunities mapped to real business workflows, enterprise constraints and measurable outcomes. |
| /agentic-ai/govern | Enterprise AI Governance \| Qlugen | Build trusted AI agent systems with clear permissions, human oversight and traceability, keeping enterprise intelligence within defined boundaries. |
| /agentic-ai/scale | Scale Enterprise AI Capabilities \| Qlugen | Extend proven AI capabilities across your enterprise with reusable foundations and platform thinking that build on what already works. |
| /how-we-work | Our Enterprise Delivery Approach \| Qlugen | See how Qlugen combines clear outcomes, thoughtful design and disciplined delivery across discovery, definition, design, build and scale. |
| /technology | Enterprise Technology & Platforms \| Qlugen | Explore the cloud, data, AI, security and enterprise platforms Qlugen works with to build solutions suited to your architecture and goals. |
| /insights | Enterprise Technology Insights \| Qlugen | Read Qlugen perspectives on enterprise AI adoption, cloud modernisation and the operating models behind digital transformation. |
| /insights/ai-pilots-to-enterprise-impact | From AI Pilots to Enterprise Impact \| Qlugen | Explore why enterprise AI adoption depends on operating models, integration, governance and workflow design as much as the models themselves. |
| /insights/modernise-without-slowing-business | Modernise Without Slowing the Business \| Qlugen | Learn how incremental modernisation can reduce legacy complexity while protecting the business operations your organisation depends on today. |
| /insights/agentic-enterprise-operating-model | Designing the Agentic Enterprise Operating Model \| Qlugen | Examine how responsibilities, governance, tool access and observability change when AI agents become active participants in enterprise workflows. |
| /company | Our Company & Principles \| Qlugen | Discover the principles behind Qlugen: enterprise ambition, technology built for real people, disciplined delivery and lasting business capability. |
| /about | About Qlugen \| Enterprise Technology Partner | Learn about Qlugen, an enterprise technology firm helping ambitious organisations turn data, AI, cloud and transformation into lasting capability. |
| /leadership | Executive Leadership \| Qlugen | Meet Vinay Pachunoori and explore the enterprise technology, global platform and product ecosystem experience guiding Qlugen. |
| /careers | Enterprise Technology Careers \| Qlugen | Explore working at Qlugen, where craft, impact and ownership shape opportunities to solve enterprise technology challenges and build lasting capability. |
| /contact | Contact Qlugen \| Discuss Your Technology Priorities | Talk to Qlugen about your enterprise technology challenges, transformation priorities and the business outcomes you want to achieve. |
| /privacy | Privacy Policy \| Qlugen | Read how Qlugen handles personal information collected through this website, including enquiries, information sharing and privacy choices. |
| /terms | Terms of Service \| Qlugen | Review the terms for using the Qlugen website, including information about its content, intellectual property and limitations of use. |
| /cookies | Cookie Policy \| Qlugen | Learn about the categories of cookies the Qlugen website may use and how to manage cookie preferences through your browser settings. |
