import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Close, Menu } from '@carbon/icons-react'
import { Grid, Column } from '@carbon/react'
import logoIcon from '../assets/logo-icon.svg'
import logoWordmark from '../assets/logo-wordmark.svg'
import '../App.css'

const navItems = [
  {
    label: 'Capabilities', to: '/capabilities',
    items: [
      { label: 'Data & Analytics', to: '/capabilities/data-analytics' },
      { label: 'AI & Agent Development', to: '/capabilities/ai-agent-development' },
      { label: 'Cloud & Infrastructure', to: '/capabilities/cloud-infrastructure' },
      { label: 'Cybersecurity', to: '/capabilities/cybersecurity' },
      { label: 'Automation', to: '/capabilities/automation' },
      { label: 'Digital Transformation', to: '/capabilities/digital-transformation' },
      { label: 'Sustainability', to: '/capabilities/sustainability' },
    ],
  },
  {
    label: 'Products & Platforms', to: '/technology',
    items: [
      { label: 'Qlugen AI Studio', to: '/technology' },
      { label: 'Qlugen Data Fabric', to: '/technology' },
      { label: 'Qlugen CloudOps', to: '/capabilities/cloud-infrastructure' },
      { label: 'Qlugen AutoFlow', to: '/capabilities/automation' },
      { label: 'Qlugen SecureEdge', to: '/capabilities/cybersecurity' },
    ],
  },
  {
    label: 'Industries', to: '/industries',
    items: [
      { label: 'Financial Services', to: '/industries/financial-services' },
      { label: 'Healthcare', to: '/industries/healthcare' },
      { label: 'Retail & Commerce', to: '/industries/retail-commerce' },
      { label: 'Manufacturing', to: '/industries/manufacturing' },
      { label: 'Government', to: '/industries/government' },
      { label: 'Energy & Utilities', to: '/industries/energy-utilities' },
    ],
  },
  { label: 'Tech Blogs', to: '/insights' },
  { label: 'Partners', to: '/#partners' },
  {
    label: 'Company', to: '/company',
    items: [
      { label: 'About Us', to: '/about' },
      { label: 'Executive Team', to: '/leadership' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
]

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const target = location.hash && document.getElementById(location.hash.slice(1))
    if (target) {
      target.scrollIntoView({ block: 'start' })
      return
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash, location.key])

  return (
    <>
      <header className="site-header" role="banner">
        <div className="site-header-inner">
          <Link to="/" className="site-logo" aria-label="Qlugen home">
            <img src={logoIcon} alt="" className="site-logo-icon" aria-hidden="true" />
            <img src={logoWordmark} alt="Qlugen" className="site-logo-wordmark" />
          </Link>

          <nav className="site-nav" aria-label="Primary navigation">
            {navItems.map(item =>
              item.items ? (
                <div key={item.label} className="nav-item nav-has-dropdown">
                  <Link to={item.to} className="nav-trigger" style={{ textDecoration: 'none' }}>
                    {item.label}
                    <ChevronDown size={14} className="nav-chevron" />
                  </Link>
                  <div className="nav-dropdown" role="menu">
                    {item.items.map(child => (
                      <Link key={child.label} to={child.to} className="nav-dropdown-link" role="menuitem">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.label} to={item.to} className="nav-link">
                  {item.label}
                </Link>
              )
            )}

            <Link to="/contact" className="nav-link nav-link--cta">Contact Us</Link>
          </nav>

          <button
            className="mobile-toggle"
            type="button"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <Close size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map(item =>
            item.items ? (
              <details key={item.label} className="mobile-nav-group">
                <summary className="mobile-nav-heading">
                  {item.label}
                  <ChevronDown size={16} className="mobile-nav-chevron" />
                </summary>
                <ul className="mobile-nav-sub">
                  {item.items.map(child => (
                    <li key={child.label}>
                      <Link to={child.to} className="mobile-nav-sub-link" onClick={() => setMobileOpen(false)}>{child.label}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <Link key={item.label} to={item.to} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>{item.label}</Link>
            )
          )}
          <Link to="/contact" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Contact Us</Link>
        </nav>
      )}

      <main>{children}</main>

      <footer className="site-footer">
        <Grid>
          <Column lg={4} md={8} sm={4} className="footer-brand-col">
            <div className="footer-logo-row">
              <img src={logoIcon} alt="" className="footer-logo-icon" aria-hidden="true" />
              <img src={logoWordmark} alt="Qlugen" className="footer-logo-wordmark" />
            </div>
            <span className="footer-tagline">Enterprise, made human.</span>
            <p className="footer-desc">Enterprise technology for organisations ready to move further.</p>
          </Column>
          <Column lg={3} md={2} sm={2} className="footer-links-col">
            <p className="footer-heading">Capabilities</p>
            <ul>
              <li><Link to="/capabilities/data-analytics">Data & Analytics</Link></li>
              <li><Link to="/capabilities/ai-agent-development">AI & Agent Development</Link></li>
              <li><Link to="/capabilities/cloud-infrastructure">Cloud & Infrastructure</Link></li>
              <li><Link to="/capabilities/cybersecurity">Cybersecurity</Link></li>
              <li><Link to="/capabilities/automation">Automation</Link></li>
              <li><Link to="/capabilities/digital-transformation">Digital Transformation</Link></li>
              <li><Link to="/capabilities/sustainability">Sustainability</Link></li>
            </ul>
          </Column>
          <Column lg={3} md={2} sm={2} className="footer-links-col">
            <p className="footer-heading">Industries</p>
            <ul>
              <li><Link to="/industries/financial-services">Financial Services</Link></li>
              <li><Link to="/industries/healthcare">Healthcare</Link></li>
              <li><Link to="/industries/retail-commerce">Retail & Commerce</Link></li>
              <li><Link to="/industries/manufacturing">Manufacturing</Link></li>
              <li><Link to="/industries/government">Government</Link></li>
              <li><Link to="/industries/energy-utilities">Energy & Utilities</Link></li>
            </ul>
          </Column>
          <Column lg={3} md={2} sm={2} className="footer-links-col">
            <p className="footer-heading">Company</p>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/how-we-work">How We Work</Link></li>
              <li><Link to="/insights">Insights</Link></li>
              <li><Link to="/leadership">Leadership</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/contact#our-location">Our location</Link></li>
            </ul>
          </Column>
          <Column lg={3} md={2} sm={2} className="footer-links-col">
            <p className="footer-heading">Legal</p>
            <ul>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/cookies">Cookies</Link></li>
            </ul>
          </Column>
        </Grid>
        <Grid className="footer-bottom">
          <Column lg={16} md={8} sm={4}>
            <span>© 2026 Qlugen. All rights reserved.</span>
          </Column>
        </Grid>
      </footer>
    </>
  )
}
