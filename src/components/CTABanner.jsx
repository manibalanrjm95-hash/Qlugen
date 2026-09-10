import { Link } from 'react-router-dom'
import { ArrowRight } from '@carbon/icons-react'
import { Grid, Column } from '@carbon/react'
import '../App.css'

export default function CTABanner({ heading, sub, btnText = 'Talk to Qlugen', btnTo = '/contact', light = false }) {
  return (
    <section className={`cta-banner${light ? ' cta-banner--light' : ''}`}>
      <Grid>
        <Column lg={10} md={6} sm={4}>
          <h2>{heading}</h2>
          {sub && <p>{sub}</p>}
          <Link to={btnTo} className="cta-btn cta-btn--primary">
            {btnText} <ArrowRight size={18} />
          </Link>
        </Column>
      </Grid>
    </section>
  )
}
