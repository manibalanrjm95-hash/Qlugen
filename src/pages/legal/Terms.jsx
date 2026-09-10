import Layout from '../../components/Layout'
import { Grid, Column } from '@carbon/react'
import { Link } from 'react-router-dom'
import '../../App.css'

export default function Terms() {
  return (
    <Layout>
      <section className="page-hero">
        <Grid>
          <Column lg={12} md={6} sm={4}>
            <p className="section-label">Legal</p>
            <h1>Terms of Service</h1>
            <p className="page-hero__sub">Last updated: August 2026</p>
          </Column>
        </Grid>
      </section>

      <section className="legal-body">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <h2>Acceptance</h2>
            <p>By accessing or using this website, you agree to these Terms of Service. If you do not agree, please do not use the website. This is a general template and should be reviewed with legal counsel before use.</p>

            <h2>Services</h2>
            <p>This website provides information about Qlugen and its enterprise technology services. The content is provided for general informational purposes and may be updated or changed at any time without notice.</p>

            <h2>Intellectual property</h2>
            <p>Unless otherwise stated, the content on this website, including text, graphics, logos and design, is owned by or licensed to Qlugen and is protected by applicable intellectual property laws. You may not reproduce or reuse this content without permission.</p>

            <h2>Limitations</h2>
            <p>This website and its content are provided "as is" without warranties of any kind. To the extent permitted by law, Qlugen is not liable for any loss or damage arising from your use of, or reliance on, the website or its content.</p>

            <h2>Governing law</h2>
            <p>These Terms are intended to be governed by the laws applicable to Qlugen's principal place of business. The specific governing law and jurisdiction should be confirmed with legal counsel.</p>

            <h2>Contact</h2>
            <p>If you have questions about these Terms, please <Link to="/contact">contact us</Link>.</p>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
