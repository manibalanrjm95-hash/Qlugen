import Layout from './Layout'
import InlineText from './InlineText'
import { Grid, Column } from '@carbon/react'
import '../App.css'

function LegalBlock({ type, text, items = [] }) {
  if (type === 'heading') return <h2>{text}</h2>
  if (type === 'list') return <ul>{items.map(item => <li key={item}><InlineText text={item} /></li>)}</ul>
  return <p><InlineText text={text} /></p>
}

export default function LegalPage({ content }) {
  const { hero, body } = content
  return (
    <Layout>
      <section className="page-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={12} md={6} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="page-hero__sub">{hero.updated}</p>
          </Column>
        </Grid>
      </section>

      <section className="legal-body">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            {body.map((block, i) => <LegalBlock key={i} {...block} />)}
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
