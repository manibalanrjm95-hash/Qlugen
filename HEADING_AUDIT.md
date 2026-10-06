# Qlugen SEO Step 2: Heading audit

Audited all 36 existing public routes plus the 404 fallback. Exactly one H1 is now present on each page. No page had multiple H1s before the changes.

Missing H1s corrected: /industries and /leadership. Existing text was reused; no visible copy was rewritten.

Major sections use H2; genuine subsections use H3 below H2. Diagram labels and repeated presentation text use styled non-heading elements.

Validation: 37 routes at 1440px and 390px; no missing/multiple H1s or skipped heading levels. Compared 1,174 original heading/label elements before and after: zero typography or width/height differences. Separate checks passed for industry selections, the principle-card heading styles, and the contact confirmation state. Production build passed. Lint reported only the existing unused released variable in Home.jsx.

The visual comparison used the same local browser and blocked external image/font requests in both runs; this verifies matching computed typography and geometry in that environment, not a live production screenshot comparison.

Re-run: node scripts/audit-headings.mjs after; node scripts/check-heading-styles.mjs; node scripts/check-heading-states.mjs. The style comparison uses the saved local baseline in .tmp/heading-audit/before.json.

## Page-by-page results

| Route | H1 before | H1 after | Correction |
| --- | --- | --- | --- |
| / | 1 | 1 | Kept one capability H3 per card; changed repeated presentation text to styled spans. |
| /capabilities | 1 | 1 | Already compliant; no changes. |
| /capabilities/data-analytics | 1 | 1 | Already compliant; no changes. |
| /capabilities/ai-agent-development | 1 | 1 | Already compliant; no changes. |
| /capabilities/cloud-infrastructure | 1 | 1 | Already compliant; no changes. |
| /capabilities/cybersecurity | 1 | 1 | Changed threat diagram H4 labels to styled spans. |
| /capabilities/automation | 1 | 1 | Already compliant; no changes. |
| /capabilities/digital-transformation | 1 | 1 | Already compliant; no changes. |
| /capabilities/sustainability | 1 | 1 | Already compliant; no changes. |
| /industries | 0 | 1 | Promoted the existing Industries label to H1 without changing its appearance. |
| /industries/financial-services | 1 | 1 | Changed priority diagram H4 labels to styled spans. |
| /industries/healthcare | 1 | 1 | Changed care pathway H4 labels to styled spans. |
| /industries/retail-commerce | 1 | 1 | Changed standalone service tile labels from H3 to styled spans. |
| /industries/manufacturing | 1 | 1 | Changed factory diagram H4 labels to styled spans. |
| /industries/government | 1 | 1 | Changed service architecture H4 labels to styled spans. |
| /industries/energy-utilities | 1 | 1 | Changed standalone service tile labels from H3 to styled spans. |
| /agentic-ai | 1 | 1 | Promoted the five top-level service card headings from H3 to H2. |
| /agentic-ai/orchestrate | 1 | 1 | Already compliant; no changes. |
| /agentic-ai/build-run | 1 | 1 | Already compliant; no changes. |
| /agentic-ai/discover | 1 | 1 | Changed discovery pathway H4 labels to styled spans. |
| /agentic-ai/govern | 1 | 1 | Already compliant; no changes. |
| /agentic-ai/scale | 1 | 1 | Changed standalone scaling diagram H3 labels to styled spans. |
| /how-we-work | 1 | 1 | Marked principle card titles as H3 below the existing H2. |
| /technology | 1 | 1 | Already compliant; no changes. |
| /insights | 1 | 1 | Already compliant; no changes. |
| /insights/ai-pilots-to-enterprise-impact | 1 | 1 | Already compliant; no changes. |
| /insights/modernise-without-slowing-business | 1 | 1 | Already compliant; no changes. |
| /insights/agentic-enterprise-operating-model | 1 | 1 | Already compliant; no changes. |
| /company | 1 | 1 | Promoted What we believe to H2 to introduce its H3 subsections. |
| /about | 1 | 1 | Promoted What we stand for to H2 to introduce its H3 subsections. |
| /leadership | 0 | 1 | Promoted Executive leadership from H2 to H1 and the executive profile name from H3 to H2. |
| /careers | 1 | 1 | Changed standalone hiring-area H3 labels to styled spans. |
| /contact | 1 | 1 | Changed enquiry group headings from H4 to H2 and confirmation heading from H3 to H2. |
| /privacy | 1 | 1 | Already compliant; no changes. |
| /terms | 1 | 1 | Already compliant; no changes. |
| /cookies | 1 | 1 | Already compliant; no changes. |
| 404 fallback (*) | 1 | 1 | Already compliant; no changes. |

SEO Step 1 remains prepared but inactive pending the confirmed production custom domain. This heading audit does not depend on that domain.
