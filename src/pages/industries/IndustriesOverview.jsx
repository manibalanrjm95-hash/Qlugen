// Interactive split-screen industry index
import { useState } from 'react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import '../../App.css'

const industries = [
  { label: 'Financial Services', desc: 'Banking, insurance and capital markets', to: '/industries/financial-services', img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Healthcare', desc: 'Providers, payers and life sciences', to: '/industries/healthcare', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Retail & Commerce', desc: 'Omnichannel, supply chain and loyalty', to: '/industries/retail-commerce', img: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Manufacturing', desc: 'Smart factory, operations and logistics', to: '/industries/manufacturing', img: 'https://images.unsplash.com/photo-1565793979145-32aea8c3e37a?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Government', desc: 'Public sector and civic services', to: '/industries/government', img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Energy & Utilities', desc: 'Grid modernisation and clean energy', to: '/industries/energy-utilities', img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80' },
]

export default function IndustriesOverview() {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = industries[activeIdx]

  return (
    <Layout>
      <div className="industry-index">
        <nav className="industry-nav" aria-label="Industries">
          {industries.map((ind, i) => (
            <Link
              key={ind.to}
              to={ind.to}
              className={`industry-nav-item${i === activeIdx ? ' industry-nav-item--active' : ''}`}
              onMouseEnter={() => setActiveIdx(i)}
              onFocus={() => setActiveIdx(i)}
            >
              <span className="industry-nav-num">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <span className="industry-nav-label">{ind.label}</span>
                <span className="industry-nav-desc">{ind.desc}</span>
              </span>
            </Link>
          ))}
        </nav>
        <div className="industry-visual">
          {industries.map((ind, i) => (
            <img key={ind.to} src={ind.img} alt={ind.label} className="industry-visual-img" style={{ opacity: i === activeIdx ? 1 : 0 }} />
          ))}
          <div className="industry-visual-overlay" />
          <div className="industry-visual-label">
            <p className="section-label" style={{ color: 'var(--q-accent)', margin: '0 0 .5rem' }}>Qlugen Industries</p>
            <h1 className="industry-visual-heading">{active.label}</h1>
          </div>
        </div>
      </div>

      <CTABanner
        heading="Ready to explore what's possible in your industry?"
        sub="Talk to the Qlugen team about your sector priorities and technology goals."
        btnTo="/contact"
      />
    </Layout>
  )
}
