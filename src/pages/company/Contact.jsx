// Minimal split-layout, high-intent
import { useState } from 'react'
import Layout from '../../components/Layout'
import { Grid, Column } from '@carbon/react'
import { ArrowRight, Enterprise, Partnership, UserFollow } from '@carbon/icons-react'
import '../../App.css'

const interests = [
  'Data & Analytics',
  'AI & Agent Development',
  'Cloud & Infrastructure',
  'Cybersecurity',
  'Automation',
  'Digital Transformation',
  'Sustainability',
  'Something else',
]

const contexts = [
  { icon: Enterprise, title: 'For enterprise enquiries', desc: 'Discuss a technology challenge or transformation priority.' },
  { icon: Partnership, title: 'For partnership', desc: 'Explore working with Qlugen as a technology partner.' },
  { icon: UserFollow, title: 'For careers', desc: 'Introduce yourself and tell us what you\'d like to build.' },
]

const initial = { firstName: '', lastName: '', email: '', company: '', role: '', interest: '', message: '', resumeName: '' }

export default function Contact() {
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
    if (!values.firstName.trim()) next.firstName = 'First name is required.'
    if (!values.lastName.trim()) next.lastName = 'Last name is required.'
    if (!values.email.trim()) next.email = 'Work email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = 'Enter a valid email address.'
    if (!values.company.trim()) next.company = 'Company is required.'
    if (!values.interest) next.interest = 'Please select an area of interest.'
    if (!values.message.trim()) next.message = 'Please tell us a little about your challenge.'
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
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80"
                  alt=""
                  className="contact-visual-band__img"
                />
                <div className="contact-visual-band__overlay" />
              </div>
              <p className="section-label">Start a conversation</p>
              <h1>What are you looking to transform?</h1>
              <p>Whether you're exploring a specific challenge or planning a large-scale transformation, our enterprise team is ready to help you define the path forward.</p>
              {contexts.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="contact-context-item">
                  <Icon size={22} />
                  <div><h2 className="contact-context-heading">{title}</h2><p>{desc}</p></div>
                </div>
              ))}
            </div>

            <div className="contact-form-wrap">
              {submitted ? (
                <div className="form-success" style={{ marginTop: 0 }}>
                  <h2 className="form-success-heading">Thanks — your message is on its way.</h2>
                  <p>We've received your details and a member of the Qlugen team will be in touch shortly.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-row">
                    <div className={`form-field${errors.firstName ? ' has-error' : ''}`}>
                      <label htmlFor="firstName">First name</label>
                      <input id="firstName" type="text" value={values.firstName} onChange={update('firstName')} />
                      {errors.firstName && <span className="form-error-msg">{errors.firstName}</span>}
                    </div>
                    <div className={`form-field${errors.lastName ? ' has-error' : ''}`}>
                      <label htmlFor="lastName">Last name</label>
                      <input id="lastName" type="text" value={values.lastName} onChange={update('lastName')} />
                      {errors.lastName && <span className="form-error-msg">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className={`form-field${errors.email ? ' has-error' : ''}`}>
                      <label htmlFor="email">Work email</label>
                      <input id="email" type="email" value={values.email} onChange={update('email')} />
                      {errors.email && <span className="form-error-msg">{errors.email}</span>}
                    </div>
                    <div className={`form-field${errors.company ? ' has-error' : ''}`}>
                      <label htmlFor="company">Company</label>
                      <input id="company" type="text" value={values.company} onChange={update('company')} />
                      {errors.company && <span className="form-error-msg">{errors.company}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="role">Role</label>
                      <input id="role" type="text" value={values.role} onChange={update('role')} />
                    </div>
                    <div className={`form-field${errors.interest ? ' has-error' : ''}`}>
                      <label htmlFor="interest">Area of interest</label>
                      <select id="interest" value={values.interest} onChange={update('interest')}>
                        <option value="">Select an area</option>
                        {interests.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                      {errors.interest && <span className="form-error-msg">{errors.interest}</span>}
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="resume">Resume</label>
                    <input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={updateResume} />
                    <span className="form-help-text">
                      {values.resumeName || 'Optional — upload PDF, DOC, or DOCX.'}
                    </span>
                  </div>

                  <div className={`form-field${errors.message ? ' has-error' : ''}`}>
                    <label htmlFor="message">Message</label>
                    <textarea id="message" value={values.message} onChange={update('message')} />
                    {errors.message && <span className="form-error-msg">{errors.message}</span>}
                  </div>

                  <div>
                    <button type="submit" className="cta-btn cta-btn--primary">
                      Send message <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <section id="our-location" className="contact-location" aria-labelledby="contact-location-heading">
            <div className="contact-location__header">
              <h2 id="contact-location-heading">Find us</h2>
              <a
                href="https://maps.app.goo.gl/8kiQbfDHqUVA6MDU9"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-location__link"
              >
                Open in Google Maps <ArrowRight size={18} />
              </a>
            </div>
            <iframe
              className="contact-location__map"
              title="Qlugen location on Google Maps"
              src="https://www.google.com/maps?q=12.9478593,77.5936611&z=17&output=embed"
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
              <span style={{ color: 'var(--q-accent)', fontWeight: 700 }}>Qlugen</span> — enterprise technology for organisations ready to move further.
            </p>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
