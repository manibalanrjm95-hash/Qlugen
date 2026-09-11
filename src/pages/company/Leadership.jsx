import { Grid, Column } from '@carbon/react'
import { LogoLinkedin } from '@carbon/icons-react'
import Layout from '../../components/Layout'
import vinayPortrait from '../../assets/vinay-pachunoori.png'
import '../../App.css'

export default function Leadership() {
  return (
    <Layout>
      <section className="exec-section leadership-page" aria-labelledby="leadership-heading">
        <Grid>
          <Column lg={11} md={5} sm={4}>
            <p className="section-label">Leadership</p>
            <h1 id="leadership-heading" className="leadership-title">Executive leadership</h1>
            <p className="section-lede">Leadership shaped by deep enterprise technology experience.</p>
          </Column>
        </Grid>

        <div className="exec-spotlight">
          <img src={vinayPortrait} alt="Vinay Pachunoori" className="exec-spotlight__image" />
          <div className="exec-spotlight__overlay" aria-hidden="true" />
          <div className="exec-spotlight__content">
            <p className="exec-spotlight__eyebrow">Executive Leadership</p>
            <h2 className="leader-name">Vinay Pachunoori</h2>
            <p className="exec-spotlight__bio">
              Vinay Pachunoori brings 23+ years of experience across enterprise technology, digital platforms and large-scale product ecosystems.
            </p>
            <div className="exec-prev-exp">
              <p className="exec-prev-exp__label">Previous Experience</p>
              <ul className="exec-prev-exp__list">
                {[
                  { name: 'Oracle',  domain: 'oracle.com'  },
                  { name: 'eBay',    domain: 'ebay.com'    },
                  { name: 'Amazon',  domain: 'amazon.com'  },
                  { name: 'Walmart', domain: 'walmart.com' },
                  { name: 'Coupang', domain: 'coupang.com' },
                ].map(({ name, domain }) => (
                  <li key={name} className="exec-prev-exp__item">
                    <img
                      src={`https://logo.clearbit.com/${domain}`}
                      alt={name}
                      className="exec-prev-exp__logo"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className="exec-prev-exp__name">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="https://www.linkedin.com/in/vinaypachunoori?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
              target="_blank"
              rel="noopener noreferrer"
              className="exec-spotlight__linkedin"
            >
              <LogoLinkedin size={20} />
              <span>LinkedIn</span>
            </a>
          </div>
          <div className="exec-spotlight__stat">
            <strong>23+ Years</strong>
            <span>Enterprise technology leadership</span>
          </div>
        </div>
      </section>
    </Layout>
  )
}
