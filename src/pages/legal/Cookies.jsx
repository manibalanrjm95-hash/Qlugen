import LegalPage from '../../components/LegalPage'
import defaultContent from '../../content/legal/cookies.json'

export default function Cookies({ content = defaultContent }) {
  return <LegalPage content={content} />
}
