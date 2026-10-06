import { Link } from 'react-router-dom'
import '../App.css'

export default function Breadcrumb({ items = [], light = false }) {
  if (!items.length) return null
  return (
    <nav className={`breadcrumb${light ? ' breadcrumb--light' : ''}`} aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="breadcrumb__sep" aria-hidden="true">/</span>}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}
