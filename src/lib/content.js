// Shared mapping from CMS content shapes to component props.

export const toRelated = items => items.map(({ eyebrow, title, description, url }) => ({ eyebrow, title, desc: description, to: url }))

export const stepNumber = index => String(index + 1).padStart(2, '0')
