import { useEffect, useRef, useState } from 'react'
import './reference/cms-reference.css'

// Qlugen CMS sign-in (Firebase Email/Password). The password goes only to Firebase.
export default function LoginScreen({ notice = '', onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const emailRef = useRef(null)

  useEffect(() => { emailRef.current?.focus() }, [])

  const submit = async event => {
    event.preventDefault()
    if (!email.trim() || !password || busy) return
    setBusy(true)
    setError('')
    try {
      await onSignIn(email.trim(), password)
    } catch (signInError) {
      setError(signInError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell>
      <form className="cms-login__card" onSubmit={submit} aria-labelledby="cms-login-title">
        <Brand />
        <h1 id="cms-login-title">Sign in</h1>
        <p className="cms-login__lead">Use your Qlugen CMS account to manage website content.</p>
        {notice && !error && <p className="cms-login__notice" role="status">{notice}</p>}

        <label className="cms-modal__field" htmlFor="cms-login-email">
          <span>Email</span>
          <input id="cms-login-email" ref={emailRef} type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required />
        </label>
        <label className="cms-modal__field" htmlFor="cms-login-password">
          <span>Password</span>
          <input id="cms-login-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
        </label>

        {error && <p className="cms-modal__error cms-modal__error--block" role="alert">{error}</p>}

        <button className="cms-login__submit" type="submit" disabled={busy || !email.trim() || !password}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </Shell>
  )
}

// Status card on the same screen: checking, access not allowed, start-up error.
LoginScreen.Message = function LoginMessage({ title, children, busy = false, onSignOut, onRetry }) {
  return (
    <Shell>
      <section className="cms-login__card" aria-live="polite" aria-busy={busy}>
        <Brand />
        <h1>{title}</h1>
        <p className="cms-login__lead">{children}</p>
        {(onSignOut || onRetry) && (
          <div className="cms-modal__actions">
            {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
            {onSignOut && <button type="button" className="is-primary" onClick={onSignOut}>Sign out</button>}
          </div>
        )}
      </section>
    </Shell>
  )
}

function Shell({ children }) {
  return <main className="cms-login">{children}</main>
}

function Brand() {
  return (
    <div className="cms-login__brand">
      <strong>Qlugen CMS</strong>
      <span>Content workspace</span>
    </div>
  )
}
