import ImageField from '../ImageField'
import { updateHomeField, toHomeEditor } from './homeEditorAdapter'

export default function HomeEditor({ value, onChange }) {
  const view = toHomeEditor(value)
  const set = (field, nextValue) => onChange(content => updateHomeField(content, field, nextValue))

  return (
    <div className="cms-admin__home-editor">
      <section className="cms-home-section cms-home-section--hero" aria-labelledby="cms-home-hero-content">
        <div className="cms-home-section__head">
          <h3 id="cms-home-hero-content">Hero Content</h3>
          <p>The opening message shown at the top of the homepage.</p>
        </div>

        <div className="cms-home-section__body cms-home-section__body--narrow">
          <label className="cms-admin__field cms-home-field--small">
            <span>Page Title</span>
            <input type="text" value={view.pageTitle} readOnly />
          </label>

          <label className="cms-admin__field cms-home-field--heading" htmlFor="cms-home-heading">
            <span>Main Heading</span>
            <textarea
              id="cms-home-heading"
              className="cms-admin__lines"
              rows={3}
              value={view.mainHeading}
              onChange={event => set('mainHeading', event.target.value)}
            />
          </label>

          <label className="cms-admin__field cms-home-field--description" htmlFor="cms-home-description">
            <span>Description</span>
            <textarea
              id="cms-home-description"
              className="cms-admin__description-area"
              rows={3}
              value={view.description}
              onChange={event => set('description', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="cms-home-section cms-home-section--secondary" aria-labelledby="cms-home-hero-link">
        <div className="cms-home-section__head">
          <h3 id="cms-home-hero-link">Hero Link</h3>
          <p>The linked words inside the hero description.</p>
        </div>
        <div className="cms-home-compact-row">
          <label className="cms-admin__field cms-home-field--compact" htmlFor="cms-home-linked-phrase">
            <span>Linked phrase</span>
            <input id="cms-home-linked-phrase" type="text" value={view.linkedPhrase} onChange={event => set('linkedPhrase', event.target.value)} />
          </label>
          <label className="cms-admin__field cms-home-field--compact" htmlFor="cms-home-link-destination">
            <span>Destination</span>
            <input id="cms-home-link-destination" type="text" value={view.linkDestination} onChange={event => set('linkDestination', event.target.value)} />
          </label>
        </div>
      </section>

      <section className="cms-home-section cms-home-section--secondary" aria-labelledby="cms-home-primary-cta">
        <div className="cms-home-section__head">
          <h3 id="cms-home-primary-cta">Primary CTA</h3>
          <p>The main action button displayed in the homepage hero.</p>
        </div>
        <div className="cms-home-compact-row">
          <label className="cms-admin__field cms-home-field--compact" htmlFor="cms-home-button-text">
            <span>Text</span>
            <input id="cms-home-button-text" type="text" value={view.buttonText} onChange={event => set('buttonText', event.target.value)} />
          </label>
          <label className="cms-admin__field cms-home-field--compact" htmlFor="cms-home-button-destination">
            <span>Destination</span>
            <input id="cms-home-button-destination" type="text" value={view.buttonDestination} onChange={event => set('buttonDestination', event.target.value)} />
          </label>
        </div>
      </section>

      <section className="cms-home-section cms-home-section--image" aria-labelledby="cms-home-banner-image">
        <div className="cms-home-section__head">
          <h3 id="cms-home-banner-image">Banner Image</h3>
          <p>The visual paired with the hero message.</p>
        </div>
        <ImageField
          label="Banner Image"
          path={['hero', 'image']}
          value={value.hero?.image}
          altKey="imageAlt"
          altValue={value.hero?.imageAlt}
          onChange={onChange}
          allowRemove={false}
          showAdvanced={false}
        />
      </section>

      <details className="cms-admin__seo-panel">
        <summary>SEO</summary>
        <label className="cms-admin__field" htmlFor="cms-home-seo-title">
          <span>SEO Title</span>
          <input id="cms-home-seo-title" type="text" value={value.seo?.title || ''} onChange={event => set('seoTitle', event.target.value)} />
        </label>
        <label className="cms-admin__field" htmlFor="cms-home-seo-description">
          <span>Meta Description</span>
          <textarea id="cms-home-seo-description" rows={3} value={value.seo?.description || ''} onChange={event => set('seoDescription', event.target.value)} />
        </label>
      </details>
    </div>
  )
}
