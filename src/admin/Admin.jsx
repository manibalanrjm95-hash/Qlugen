import { useEffect, useState } from 'react'
import LoginScreen from './LoginScreen'
import VisualAdmin from './VisualAdmin'
import { firebaseConfigured, signIn, signInErrorMessage, signOut, watchUser } from './firebaseAuth'
import { getIdentity } from './cmsApi'

// Auth state machine:
//   checking   – waiting for Firebase / identity check (initial + after Firebase auth change)
//   login      – no signed-in user, show LoginScreen
//   verifying  – Firebase user exists, verifying with CMS API
//   forbidden  – signed in but not an admin
//   error      – network or unexpected failure
//   ready      – verified identity, show VisualAdmin
export default function Admin() {
  const [phase, setPhase] = useState('checking')
  const [identity, setIdentity] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    // If Firebase is not configured, probe the API directly: auth-disabled mode returns identity
    // immediately; anything else means misconfiguration.
    if (!firebaseConfigured) {
      getIdentity()
        .then(id => { setIdentity(id); setPhase('ready') })
        .catch(() => setPhase('error'))
      return
    }

    let unsubscribe
    watchUser(async user => {
      if (!user) {
        // No Firebase session. Check if the API is running in auth-disabled mode.
        try {
          const id = await getIdentity()
          if (id.mode === 'disabled') { setIdentity(id); setPhase('ready'); return }
        } catch { /* auth required */ }
        setIdentity(null)
        setPhase('login')
        return
      }

      setPhase('verifying')
      try {
        const id = await getIdentity()
        setIdentity(id)
        setPhase('ready')
      } catch (error) {
        setIdentity(null)
        setPhase(error?.status === 403 ? 'forbidden' : 'error')
      }
    }).then(unsub => { unsubscribe = unsub })

    return () => unsubscribe?.()
  }, [])

  const handleSignIn = async (email, password) => {
    try {
      await signIn(email, password)
      // watchUser callback takes over from here
    } catch (error) {
      throw new Error(signInErrorMessage(error))
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIdentity(null)
    setNotice('You have been signed out.')
    setPhase('login')
  }

  if (phase === 'checking' || phase === 'verifying') {
    return (
      <LoginScreen.Message title="Signing in…" busy>
        {phase === 'verifying' ? 'Verifying your account…' : 'Checking your session…'}
      </LoginScreen.Message>
    )
  }

  if (phase === 'forbidden') {
    return (
      <LoginScreen.Message title="Access denied" onSignOut={handleSignOut}>
        Your account does not have admin access to this CMS.
      </LoginScreen.Message>
    )
  }

  if (phase === 'error') {
    return (
      <LoginScreen.Message title="Sign-in error" onRetry={() => { setPhase('checking'); window.location.reload() }}>
        Could not reach the CMS API. Check your connection and try again.
      </LoginScreen.Message>
    )
  }

  if (phase === 'login') {
    return <LoginScreen notice={notice} onSignIn={handleSignIn} />
  }

  return <VisualAdmin identity={identity} onSignOut={handleSignOut} />
}
