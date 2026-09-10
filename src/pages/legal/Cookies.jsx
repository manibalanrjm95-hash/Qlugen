import Layout from '../../components/Layout'
import { Grid, Column } from '@carbon/react'
import { Link } from 'react-router-dom'
import '../../App.css'

export default function Cookies() {
  return (
    <Layout>
      <section className="page-hero">
        <Grid>
          <Column lg={12} md={6} sm={4}>
            <p className="section-label">Legal</p>
            <h1>Cookie Policy</h1>
            <p className="page-hero__sub">Last updated: August 2026</p>
          </Column>
        </Grid>
      </section>

      <section className="legal-body">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <h2>What cookies are</h2>
            <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work, or work more efficiently, and to provide information to the website operators. This is a general template and should be reviewed with legal counsel before use.</p>

            <h2>Types we use</h2>
            <p>This website may use the following categories of cookies:</p>
            <ul>
              <li><strong>Essential cookies</strong> — required for the website to function properly.</li>
              <li><strong>Performance cookies</strong> — help us understand how the website is used so we can improve it.</li>
              <li><strong>Functional cookies</strong> — remember choices you make to improve your experience.</li>
            </ul>

            <h2>Managing preferences</h2>
            <p>You can control and manage cookies through your browser settings, including deleting existing cookies or preventing new ones from being set. Please note that disabling certain cookies may affect how the website functions.</p>

            <h2>Contact</h2>
            <p>If you have questions about our use of cookies, please <Link to="/contact">contact us</Link>.</p>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
