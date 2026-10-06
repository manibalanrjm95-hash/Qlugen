import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Close, Menu } from '@carbon/icons-react'
import { Grid, Column } from '@carbon/react'
import logoIcon from '../assets/logo-icon.svg'
import logoWordmark from '../assets/logo-wordmark.svg'
import navigation from '../content/global/navigation.json'
import footer from '../content/global/footer.json'
import '../App.css'

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
          <Link to="/" className="site-logo" aria-label={navigation.homeLabel}>
            <img src={logoIcon} alt="" className="site-logo-icon" aria-hidden="true" />
            <img src={logoWordmark} alt={navigation.logoAlt} className="site-logo-wordmark" />
          </Link>

          <nav className="site-nav" aria-label={navigation.accessibility.primaryNavLabel}>
            {navigation.items.map(item =>
              item.items ? (
                <div key={item.label} className="nav-item nav-has-dropdown">
                  <Link to={item.url} className="nav-trigger" style={{ textDecoration: 'none' }}>
                    {item.label}
                    <ChevronDown size={14} className="nav-chevron" />
                  </Link>
                  <div className="nav-dropdown" role="menu">
                    {item.items.map(child => (
                      <Link key={child.label} to={child.url} className="nav-dropdown-link" role="menuitem">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.label} to={item.url} className="nav-link">
                  {item.label}
                </Link>
              )
            )}

            <Link to={navigation.cta.url} className="nav-link nav-link--cta">{navigation.cta.label}</Link>
          </nav>

          <button
            className="mobile-toggle"
            type="button"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? navigation.accessibility.closeMenuLabel : navigation.accessibility.openMenuLabel}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <Close size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav className="mobile-nav" aria-label={navigation.accessibility.mobileNavLabel}>
          {navigation.items.map(item =>
            item.items ? (
              <details key={item.label} className="mobile-nav-group">
                <summary className="mobile-nav-heading">
                  {item.label}
                  <ChevronDown size={16} className="mobile-nav-chevron" />
                </summary>
                <ul className="mobile-nav-sub">
                  {item.items.map(child => (
                    <li key={child.label}>
                      <Link to={child.url} className="mobile-nav-sub-link" onClick={() => setMobileOpen(false)}>{child.label}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <Link key={item.label} to={item.url} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>{item.label}</Link>
            )
          )}
          <Link to={navigation.cta.url} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>{navigation.cta.label}</Link>
        </nav>
      )}

      <main>{children}</main>

      <footer className="site-footer">
        <Grid>
          <Column lg={4} md={8} sm={4} className="footer-brand-col">
            <div className="footer-logo-row">
              <img src={logoIcon} alt="" className="footer-logo-icon" aria-hidden="true" />
              <img src={logoWordmark} alt={footer.brand.logoAlt} className="footer-logo-wordmark" />
            </div>
            <span className="footer-tagline">{footer.brand.tagline}</span>
            <p className="footer-desc">{footer.brand.description}</p>
          </Column>
          {footer.sections.map(section => (
            <Column key={section.heading} lg={3} md={2} sm={2} className="footer-links-col">
              <p className="footer-heading">{section.heading}</p>
              <ul>
                {section.links.map(link => (
                  <li key={`${section.heading}-${link.url}`}><Link to={link.url}>{link.label}</Link></li>
                ))}
              </ul>
            </Column>
          ))}
        </Grid>
        <Grid className="footer-bottom">
          <Column lg={16} md={8} sm={4}>
            <span>{footer.copyright}</span>
          </Column>
        </Grid>
      </footer>
    </>
  )
}
