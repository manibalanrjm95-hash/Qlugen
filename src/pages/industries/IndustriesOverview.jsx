// Interactive split-screen industry index
import { useState } from 'react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import content from '../../content/industries/overview.json'
import { stepNumber } from '../../lib/content'
import '../../App.css'

export default function IndustriesOverview() {
  const { index, cta } = content
  const [activeIdx, setActiveIdx] = useState(0)
  const active = index.items[activeIdx]

  return (
    <Layout>
      <div className="industry-index">
        <nav className="industry-nav" aria-label={index.ariaLabel}>
          {index.items.map((ind, i) => (
            <Link
              key={ind.url}
              to={ind.url}
              className={`industry-nav-item${i === activeIdx ? ' industry-nav-item--active' : ''}`}
              onMouseEnter={() => setActiveIdx(i)}
              onFocus={() => setActiveIdx(i)}
            >
              <span className="industry-nav-num">{stepNumber(i)}</span>
              <span>
                <span className="industry-nav-label">{ind.label}</span>
                <span className="industry-nav-desc">{ind.description}</span>
              </span>
            </Link>
          ))}
        </nav>
        <div className="industry-visual">
          {index.items.map((ind, i) => (
            <img
              key={ind.url}
              src={ind.image}
              alt={ind.imageAlt || ind.label}
              className="industry-visual-img"
              style={{ opacity: i === activeIdx ? 1 : 0 }}
            />
          ))}
          <div className="industry-visual-overlay" />
          <div className="industry-visual-label">
            <p className="section-label" style={{ color: 'var(--q-accent)', margin: '0 0 .5rem' }}>{index.eyebrow}</p>
            <h1 className="industry-visual-heading">{active.label}</h1>
          </div>
        </div>
      </div>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
