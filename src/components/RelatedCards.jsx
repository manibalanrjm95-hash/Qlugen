import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../App.css'

export default function RelatedCards({ heading = 'Related capabilities', items = [] }) {
  return (
    <section className="related-section">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2>{heading}</h2>
          <div className="related-grid">
            {items.map((item) => (
              <Link key={item.to} to={item.to} className="related-card">
                {item.eyebrow && <p className="tile-eyebrow">{item.eyebrow}</p>}
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="related-card__footer">
                  <span className="related-card__arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Column>
      </Grid>
    </section>
  )
}
