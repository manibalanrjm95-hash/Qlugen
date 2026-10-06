// Minimal split-layout, high-intent
import { useState } from 'react'
import Layout from '../../components/Layout'
import { Grid, Column } from '@carbon/react'
import { ArrowRight, Enterprise, Partnership, UserFollow } from '@carbon/icons-react'
import content from '../../content/contact.json'
import '../../App.css'

const contextIcons = [Enterprise, Partnership, UserFollow]

const initial = { firstName: '', lastName: '', email: '', company: '', role: '', interest: '', message: '', resumeName: '' }

export default function Contact() {
  const { intro, form, location, closing } = content
  const { labels, errors: messages } = form
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const update = (field) => (e) => setValues(v => ({ ...v, [field]: e.target.value }))
  const updateResume = (e) => {
    const file = e.target.files?.[0]
    setValues(v => ({ ...v, resumeName: file ? file.name : '' }))
  }

  const validate = () => {
    const next = {}
    if (!values.firstName.trim()) next.firstName = messages.firstName
    if (!values.lastName.trim()) next.lastName = messages.lastName
    if (!values.email.trim()) next.email = messages.emailRequired
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = messages.emailInvalid
    if (!values.company.trim()) next.company = messages.company
    if (!values.interest) next.interest = messages.interest
    if (!values.message.trim()) next.message = messages.message
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length === 0) {
      setSubmitted(true)
    }
  }

  return (
    <Layout>
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="contact-split">
            <div className="contact-left">
              <div className="contact-visual-band">
                <img
                  src={intro.image}
                  alt={intro.imageAlt || ''}
                  className="contact-visual-band__img"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="contact-visual-band__overlay" />
              </div>
              <p className="section-label">{intro.eyebrow}</p>
              <h1>{intro.title}</h1>
              <p>{intro.description}</p>
              {intro.contexts.map(({ title, description }, i) => {
                const Icon = contextIcons[i % contextIcons.length]
                return (
                  <div key={title} className="contact-context-item">
                    <Icon size={22} />
                    <div><h2 className="contact-context-heading">{title}</h2><p>{description}</p></div>
                  </div>
                )
              })}
            </div>

            <div className="contact-form-wrap">
              {submitted ? (
                <div className="form-success" style={{ marginTop: 0 }}>
                  <h2 className="form-success-heading">{form.success.title}</h2>
                  <p>{form.success.body}</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-row">
                    <div className={`form-field${errors.firstName ? ' has-error' : ''}`}>
                      <label htmlFor="firstName">{labels.firstName}</label>
                      <input id="firstName" type="text" value={values.firstName} onChange={update('firstName')} />
                      {errors.firstName && <span className="form-error-msg">{errors.firstName}</span>}
                    </div>
                    <div className={`form-field${errors.lastName ? ' has-error' : ''}`}>
                      <label htmlFor="lastName">{labels.lastName}</label>
                      <input id="lastName" type="text" value={values.lastName} onChange={update('lastName')} />
                      {errors.lastName && <span className="form-error-msg">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className={`form-field${errors.email ? ' has-error' : ''}`}>
                      <label htmlFor="email">{labels.email}</label>
                      <input id="email" type="email" value={values.email} onChange={update('email')} />
                      {errors.email && <span className="form-error-msg">{errors.email}</span>}
                    </div>
                    <div className={`form-field${errors.company ? ' has-error' : ''}`}>
                      <label htmlFor="company">{labels.company}</label>
                      <input id="company" type="text" value={values.company} onChange={update('company')} />
                      {errors.company && <span className="form-error-msg">{errors.company}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="role">{labels.role}</label>
                      <input id="role" type="text" value={values.role} onChange={update('role')} />
                    </div>
                    <div className={`form-field${errors.interest ? ' has-error' : ''}`}>
                      <label htmlFor="interest">{labels.interest}</label>
                      <select id="interest" value={values.interest} onChange={update('interest')}>
                        <option value="">{form.interestPlaceholder}</option>
                        {form.interests.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                      {errors.interest && <span className="form-error-msg">{errors.interest}</span>}
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="resume">{labels.resume}</label>
                    <input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={updateResume} />
                    <span className="form-help-text">
                      {values.resumeName || form.resumeHelp}
                    </span>
                  </div>

                  <div className={`form-field${errors.message ? ' has-error' : ''}`}>
                    <label htmlFor="message">{labels.message}</label>
                    <textarea id="message" value={values.message} onChange={update('message')} />
                    {errors.message && <span className="form-error-msg">{errors.message}</span>}
                  </div>

                  <div>
                    <button type="submit" className="cta-btn cta-btn--primary">
                      {form.submitLabel} <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <section id="our-location" className="contact-location" aria-labelledby="contact-location-heading">
            <div className="contact-location__header">
              <h2 id="contact-location-heading">{location.title}</h2>
              <a
                href={location.mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-location__link"
              >
                {location.mapLinkLabel} <ArrowRight size={18} />
              </a>
            </div>
            <iframe
              className="contact-location__map"
              title={location.mapTitle}
              src={location.mapEmbedUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        </Column>
      </Grid>

      <section style={{ background: 'var(--q-primary)', color: '#fff', padding: '2.5rem 0' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p style={{ margin: 0, fontSize: '1rem', color: 'rgba(255,255,255,.75)' }}>
              <span style={{ color: 'var(--q-accent)', fontWeight: 700 }}>{closing.accent}</span> {closing.text}
            </p>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
