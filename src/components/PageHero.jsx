import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import '../App.css'

export default function PageHero({ eyebrow, title, subtitle, light = false, breadcrumb = [] }) {
  return (
    <section className={`page-hero${light ? ' page-hero--light' : ''}`}>
      <Grid>
        <Column lg={12} md={6} sm={4}>
          {breadcrumb.length > 0 && (
            <nav className={`breadcrumb${light ? ' breadcrumb--light' : ''}`} aria-label="Breadcrumb">
              {breadcrumb.map((item, i) => (
                <span key={i}>
                  {i > 0 && <span className="breadcrumb__sep" aria-hidden="true">/</span>}
                  {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
                </span>
              ))}
            </nav>
          )}
          {eyebrow && <p className="section-label">{eyebrow}</p>}
          <h1>{title}</h1>
          {subtitle && <p className="page-hero__sub">{subtitle}</p>}
        </Column>
      </Grid>
    </section>
  )
}
