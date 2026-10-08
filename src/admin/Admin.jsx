import { useEffect, useState } from 'react'
import LoginScreen from './LoginScreen'
import VisualAdmin from './VisualAdmin'
import { SESSION_EXPIRED_EVENT, getIdentity } from './cmsApi'
import { firebaseConfigured, signIn, signInErrorMessage, signOut, watchUser } from './firebaseAuth'

// /admin: the CMS opens only for an identity the CMS Worker has verified.
// - Local development: the local Worker answers without sign-in ("local-admin").
// - Otherwise: Firebase Email/Password sign-in; the Worker verifies the ID token and allows only
//   approved admins. An expired or rejected session returns here, to the sign-in screen.
// Local development without Firebase settings (Vite dev server only, never a build): no sign-in
// gate, so the editor loads straight away and reports CMS API problems itself ("Preview couldn't
// load." + Retry). Built apps (staging) always go through the gate, and the Worker enforces
// sign-in on /api/admin/* regardless of what the browser shows.
const localDevWithoutSignIn = import.meta.env.DEV && !firebaseConfigured

export default function Admin() {
  return localDevWithoutSignIn ? <VisualAdmin /> : <SignInGate />
}

function SignInGate() {
  const [state, setState] = useState({ phase: 'checking' }) // checking | login | denied | ready | error
  const [notice, setNotice] = useState('')

  const resolveIdentity = signedIn => identify(signedIn).then(setState)

  useEffect(() => {
    if (!firebaseConfigured) {
      identify(false).then(setState)
      return undefined
    }
    let unsubscribe = () => {}
    let active = true
    watchUser(user => {
      if (!active) return
      setState({ phase: 'checking' })
      identify(Boolean(user)).then(next => active && setState(next))
    }).then(stop => {
      unsubscribe = stop
      if (!active) stop()
    }).catch(error => setState({ phase: 'error', message: error.message }))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  // A rejected token anywhere in the CMS: sign out and return to the sign-in screen.
  useEffect(() => {
    const onExpired = () => {
      setNotice('Your session has expired. Please sign in again.')
      signOut().catch(() => {})
      setState({ phase: 'login' })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const handleSignIn = async (email, password) => {
    try {
      setNotice('')
      await signIn(email, password) // watchUser then verifies the new session with the Worker
    } catch (error) {
      throw new Error(signInErrorMessage(error))
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setNotice('You have signed out.')
    setState({ phase: 'login' })
  }

  if (state.phase === 'ready') {
    return <VisualAdmin identity={state.identity} onSignOut={state.identity.mode === 'firebase' ? handleSignOut : null} />
  }
  if (state.phase === 'login') return <LoginScreen notice={notice} onSignIn={handleSignIn} />
  if (state.phase === 'denied') {
    return (
      <LoginScreen.Message title="Access not allowed" onSignOut={handleSignOut}>
        {state.message} Ask a CMS administrator to add this account, or sign in with another one.
      </LoginScreen.Message>
    )
  }
  if (state.phase === 'error') {
    return (
      <LoginScreen.Message title="The CMS could not start" onRetry={() => { setState({ phase: 'checking' }); resolveIdentity(false) }}>
        {state.message}
      </LoginScreen.Message>
    )
  }
  return <LoginScreen.Message title="Qlugen CMS" busy>Checking your sign-in...</LoginScreen.Message>
}

// Ask the Worker who we are (it decides; the browser never does). Returns the next screen state.
async function identify(signedIn) {
  try {
    return { phase: 'ready', identity: await getIdentity() }
  } catch (error) {
    if (error.status === 403) return { phase: 'denied', message: error.message }
    if (error.status === 401 && !firebaseConfigured) {
      return { phase: 'error', message: 'Sign-in is not configured for this CMS build (missing Firebase settings).' }
    }
    if (error.status === 401 || !signedIn) return { phase: firebaseConfigured ? 'login' : 'error', message: error.message }
    return { phase: 'error', message: error.message }
  }
}
