import { updateAtPath } from '../contentEditor'

export function toHomeEditor(content) {
  const hero = content?.hero || {}
  return {
    pageTitle: 'Overview',
    mainHeading: Array.isArray(hero.titleLines) ? hero.titleLines.join('\n') : '',
    description: joinSentence(hero.descriptionBeforeLink, hero.descriptionLinkLabel, hero.descriptionAfterLink),
    linkedPhrase: hero.descriptionLinkLabel || '',
    linkDestination: hero.descriptionLinkUrl || '',
    buttonText: hero.ctaLabel || '',
    buttonDestination: hero.ctaUrl || '',
  }
}

export function updateHomeField(content, field, value) {
  switch (field) {
    case 'mainHeading':
      return updateAtPath(content, ['hero', 'titleLines'], splitLines(value))
    case 'description':
      return updateDescription(content, value)
    case 'linkedPhrase':
      return updateAtPath(content, ['hero', 'descriptionLinkLabel'], value)
    case 'linkDestination':
      return updateAtPath(content, ['hero', 'descriptionLinkUrl'], value)
    case 'buttonText':
      return updateAtPath(content, ['hero', 'ctaLabel'], value)
    case 'buttonDestination':
      return updateAtPath(content, ['hero', 'ctaUrl'], value)
    case 'seoTitle':
      return updateAtPath(content, ['seo', 'title'], value)
    case 'seoDescription':
      return updateAtPath(content, ['seo', 'description'], value)
    default:
      return content
  }
}

function updateDescription(content, description) {
  const phrase = content.hero?.descriptionLinkLabel || ''
  const index = phrase ? description.indexOf(phrase) : -1
  if (index < 0) {
    return updateAtPath(
      updateAtPath(content, ['hero', 'descriptionBeforeLink'], description.trim()),
      ['hero', 'descriptionAfterLink'],
      '',
    )
  }
  return updateAtPath(
    updateAtPath(content, ['hero', 'descriptionBeforeLink'], description.slice(0, index).trim()),
    ['hero', 'descriptionAfterLink'],
    description.slice(index + phrase.length).trim(),
  )
}

function splitLines(value) {
  return value.split('\n').map(line => line.trim()).filter(Boolean)
}

function joinSentence(...parts) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}
