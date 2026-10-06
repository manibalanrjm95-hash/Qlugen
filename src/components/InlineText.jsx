import { Fragment } from 'react'
import { Link } from 'react-router-dom'

// CMS copy supports exactly two inline marks — [label](/url) links and **bold** —
// so editors can write legal/editorial text without raw HTML.
const inlinePattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g

export default function InlineText({ text = '' }) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(inlinePattern)) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const [, label, url, bold] = match
    if (bold) parts.push(<strong>{bold}</strong>)
    else if (url.startsWith('/')) parts.push(<Link to={url}>{label}</Link>)
    else parts.push(<a href={url} target="_blank" rel="noopener noreferrer">{label}</a>)
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>)
}
