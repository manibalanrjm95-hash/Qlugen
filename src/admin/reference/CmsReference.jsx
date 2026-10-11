import { useState } from 'react'
import './cms-reference.css'

const capabilityCards = [
  ['AI Agent Development', 'Build intelligent agents that transform how work gets done.', '⌘', 'blue'],
  ['Automation', 'Streamline operations and drive efficiency at scale.', '⬡', 'purple'],
  ['Cloud Infrastructure', 'Build secure, scalable and resilient cloud environments.', '⎈', 'green'],
]

const navItems = [
  'Home',
  'Capabilities',
  'Products & Platforms',
  'Industries',
  'Insights',
  'About Us',
  'Leadership',
  'Careers',
  'Legal',
  'Not Found',
]

export default function CmsReference() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="cms-ref">
      <aside className="cms-ref__sidebar">
        <div className="cms-ref__brand">
          <strong>Qlugen CMS</strong>
          <span>Content workspace</span>
        </div>

        <label className="cms-ref__search">
          <span>⌕</span>
          <input type="text" value="Search pages..." readOnly />
          <em>×</em>
        </label>

        <nav className="cms-ref__nav" aria-label="Pages">
          {navItems.map(item => (
            <button className={item === 'Home' ? 'is-active' : ''} type="button" key={item}>
              <span className="cms-ref__nav-icon">{iconFor(item)}</span>
              {item}
            </button>
          ))}
          <button className="cms-ref__add" type="button" onClick={() => setShowCreate(true)}>+ Add Page</button>
        </nav>

        <div className="cms-ref__global">
          <strong>Global</strong>
          <button type="button"><span>☷</span>Navigation</button>
          <button type="button"><span>▱</span>Footer</button>
          <button type="button"><span>◉</span>SEO</button>
        </div>

        <button className="cms-ref__media" type="button"><span>▧</span>Media Library</button>
      </aside>

      <main className="cms-ref__main">
        <header className="cms-ref__topbar">
          <div className="cms-ref__crumbs">Home <span>›</span> Overview</div>
          <div className="cms-ref__status"><span />Published</div>
          <p>Last saved 2 minutes ago</p>
          <div className="cms-ref__device">
            <button className="is-active" type="button">▱ Desktop</button>
            <button type="button">▯ Tablet</button>
            <button type="button">▯ Mobile</button>
          </div>
          <div className="cms-ref__actions">
            <button type="button">Preview ↗</button>
            <button type="button">↻ Versions</button>
            <button className="is-primary" type="button">▱ Publish</button>
            <button className="cms-ref__dots" type="button">•••</button>
          </div>
        </header>

        <div className="cms-ref__workbench">
          <section className="cms-ref__canvas" aria-label="Homepage preview">
            <div className="cms-ref__site-header">
              <strong>QLUGEN</strong>
              <nav>
                <span>Capabilities</span>
                <span>Products</span>
                <span>Industries</span>
                <span>Insights</span>
                <span>About Us</span>
              </nav>
              <button type="button">Contact Us →</button>
            </div>

            <section className="cms-ref__hero">
              <div className="cms-ref__hero-copy">
                <div className="cms-ref__selection-tag">Heading</div>
                <div className="cms-ref__selected">
                  <h1>Powering the next<br />generation of<br />enterprise.</h1>
                  <div className="cms-ref__float">
                    <button type="button">⋮⋮</button>
                    <button type="button">Edit Text</button>
                    <button type="button">⌫</button>
                  </div>
                </div>
                <p>The next-generation enterprise services platform<br />for ambitious global organisations — across<br />industries, geographies, and technologies.</p>
                <button className="cms-ref__hero-cta" type="button">Explore capabilities →</button>
              </div>
              <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85" alt="" />
            </section>

            <section className="cms-ref__capabilities">
              <p>WHAT WE DO</p>
              <h2>Our Capabilities</h2>
              <span>From strategy to execution, we help you unlock new possibilities<br />and create lasting impact.</span>
              <div className="cms-ref__cards">
                {capabilityCards.map(([title, body, mark, color]) => (
                  <article key={title}>
                    <div className={`cms-ref__card-icon is-${color}`}>{mark}</div>
                    <div>
                      <h3>{title}</h3>
                      <p>{body}</p>
                    </div>
                    <button type="button">→</button>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="cms-ref__panel" aria-label="Contextual properties">
            <div className="cms-ref__panel-head">
              <h2>Heading</h2>
              <button type="button">×</button>
            </div>
            <div className="cms-ref__tabs">
              <button className="is-active" type="button">Content</button>
            </div>
            <div className="cms-ref__property">
              <h3>☼ Text</h3>
              <textarea value={'Powering the next\ngeneration of\nenterprise.'} readOnly />
              <small>38/200</small>
            </div>
            <div className="cms-ref__accordion">› Highlight <span>(optional)</span><i /></div>
            <div className="cms-ref__property">
              <h3>⌕ Link</h3>
              <label>Button Text<input type="text" value="Explore capabilities" readOnly /></label>
              <label>Link URL<input type="text" value="/capabilities" readOnly /></label>
              <div className="cms-ref__toggle-row">Open in new tab <i /></div>
            </div>
            <div className="cms-ref__accordion">› Advanced</div>
          </aside>
        </div>
      </main>

      {showCreate && (
        <div className="cms-ref__modal-backdrop" role="presentation">
          <div className="cms-ref__modal" role="dialog" aria-modal="true" aria-labelledby="cms-ref-create-title">
            <h2 id="cms-ref-create-title">Create New Page</h2>
            <label>Page Name<input type="text" value="Digital Engineering" readOnly /></label>
            <label>URL Slug<input type="text" value="/digital-engineering" readOnly /></label>
            <label>Template<select value="standard" readOnly><option value="standard">Standard Landing Page</option></select></label>
            <div>
              <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="button" onClick={() => setShowCreate(false)}>Create Page</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function iconFor(item) {
  if (item === 'Home') return '⌂'
  if (item === 'Capabilities') return '♙'
  if (item === 'Products & Platforms') return '✧'
  if (item === 'Industries') return '◇'
  if (item === 'Insights') return '✥'
  if (item === 'About Us') return '♧'
  if (item === 'Leadership') return '♘'
  if (item === 'Careers') return '▣'
  if (item === 'Legal') return '▤'
  return '▱'
}
