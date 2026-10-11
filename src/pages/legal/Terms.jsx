import LegalPage from '../../components/LegalPage'
import defaultContent from '../../content/legal/terms.json'

export default function Terms({ content = defaultContent }) {
  return <LegalPage content={content} />
}
