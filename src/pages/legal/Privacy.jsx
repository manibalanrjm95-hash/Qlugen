import Layout from '../../components/Layout'
import { Grid, Column } from '@carbon/react'
import { Link } from 'react-router-dom'
import '../../App.css'

export default function Privacy() {
  return (
    <Layout>
      <section className="page-hero">
        <Grid>
          <Column lg={12} md={6} sm={4}>
            <p className="section-label">Legal</p>
            <h1>Privacy Policy</h1>
            <p className="page-hero__sub">Last updated: August 2026</p>
          </Column>
        </Grid>
      </section>

      <section className="legal-body">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <h2>Introduction</h2>
            <p>This Privacy Policy explains how Qlugen ("we", "us", "our") handles personal information collected through this website. It is intended to help you understand what information we collect, how we use it, and the choices available to you. This is a general policy template and should be reviewed with legal counsel before use.</p>

            <h2>Information we collect</h2>
            <p>We may collect information that you provide directly, such as when you complete a contact form. This can include your name, work email address, company, role and the content of your message. We may also collect limited technical information automatically, such as basic usage data, to help operate and improve the website.</p>

            <h2>How we use information</h2>
            <p>We use the information we collect to respond to enquiries, communicate with you about your request, operate and improve our website, and for other legitimate business purposes described at the point of collection.</p>
            <ul>
              <li>To respond to and manage your enquiries.</li>
              <li>To operate, maintain and improve the website.</li>
              <li>To communicate relevant information you have requested.</li>
            </ul>

            <h2>Sharing</h2>
            <p>We do not sell personal information. We may share information with service providers who support our operations, and where required to comply with applicable law. Any such sharing is limited to what is necessary for the relevant purpose.</p>

            <h2>Cookies</h2>
            <p>Our website may use cookies and similar technologies. You can find more detail in our <Link to="/cookies">Cookie Policy</Link>, including information about how to manage your preferences.</p>

            <h2>Your rights</h2>
            <p>Depending on your location, you may have rights relating to your personal information, such as the right to access, correct or request deletion of your data. To exercise any such rights, please contact us using the details below.</p>

            <h2>Contact</h2>
            <p>If you have questions about this Privacy Policy, please <Link to="/contact">get in touch</Link> and a member of our team will respond.</p>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
