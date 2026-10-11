import LegalPage from '../../components/LegalPage'
import defaultContent from '../../content/legal/privacy.json'

export default function Privacy({ content = defaultContent }) {
  return <LegalPage content={content} />
}
