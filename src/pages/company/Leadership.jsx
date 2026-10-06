import { Grid, Column } from '@carbon/react'
import { LogoLinkedin } from '@carbon/icons-react'
import Layout from '../../components/Layout'
import content from '../../content/company/leadership.json'
import '../../App.css'

export default function Leadership() {
  const { intro, leader } = content
  return (
    <Layout>
      <section className="exec-section leadership-page" aria-labelledby="leadership-heading">
        <Grid>
          <Column lg={11} md={5} sm={4}>
            <p className="section-label">{intro.eyebrow}</p>
            <h1 id="leadership-heading" className="leadership-title">{intro.title}</h1>
            <p className="section-lede">{intro.description}</p>
          </Column>
        </Grid>

        <div className="exec-spotlight">
          <img src={leader.portrait} alt={leader.portraitAlt} className="exec-spotlight__image" loading="lazy" decoding="async" />
          <div className="exec-spotlight__overlay" aria-hidden="true" />
          <div className="exec-spotlight__content">
            <p className="exec-spotlight__eyebrow">{leader.eyebrow}</p>
            <h2 className="leader-name">{leader.name}</h2>
            <p className="exec-spotlight__bio">{leader.bio}</p>
            <div className="exec-prev-exp">
              <p className="exec-prev-exp__label">{leader.experienceLabel}</p>
              <div className="exec-prev-exp__row">
                {leader.experience.map(({ name, logo, logoAlt }) => (
                  <span key={name} className="exec-prev-exp__item">
                    <img src={logo} alt={logoAlt || name} className="exec-prev-exp__logo" />
                  </span>
                ))}
              </div>
            </div>
            <a href={leader.linkedinUrl} target="_blank" rel="noopener noreferrer" className="exec-spotlight__linkedin">
              <LogoLinkedin size={20} />
              <span>{leader.linkedinLabel}</span>
            </a>
          </div>
          <div className="exec-spotlight__stat">
            <strong>{leader.statValue}</strong>
            <span>{leader.statLabel}</span>
          </div>
        </div>
      </section>
    </Layout>
  )
}
