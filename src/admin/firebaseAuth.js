// Firebase Email/Password sign-in for the CMS admin (admin bundle only; the public site never loads
// Firebase). The browser only obtains an ID token; the CMS Worker verifies it and decides whether
// the user is an approved admin. Passwords go straight to Firebase, never to the CMS.
//
// Config (public Firebase web-app values, from the Firebase console):
//   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID
// Local tests only: VITE_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 (Firebase Auth emulator).

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
const emulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST

export const firebaseConfigured = Boolean(config.apiKey && config.projectId)

let authPromise = null

async function loadAuth() {
  if (!firebaseConfigured) throw new Error('Firebase sign-in is not configured.')
  authPromise ??= (async () => {
    const [{ initializeApp }, firebaseAuth] = await Promise.all([import('firebase/app'), import('firebase/auth')])
    const app = initializeApp(config, 'qlugen-cms')
    const auth = firebaseAuth.getAuth(app)
    if (emulatorHost) firebaseAuth.connectAuthEmulator(auth, `http://${emulatorHost}`, { disableWarnings: true })
    return { auth, api: firebaseAuth }
  })()
  return authPromise
}

// Calls back with the signed-in Firebase user (or null) now and on every change. Returns unsubscribe.
export async function watchUser(callback) {
  const { auth, api } = await loadAuth()
  return api.onAuthStateChanged(auth, callback)
}

export async function signIn(email, password) {
  const { auth, api } = await loadAuth()
  await api.signInWithEmailAndPassword(auth, email, password)
}

export async function signOut() {
  if (!firebaseConfigured) return
  const { auth, api } = await loadAuth()
  await api.signOut(auth)
}

// A current ID token for the signed-in user (Firebase refreshes it when it is about to expire).
export async function currentIdToken() {
  if (!firebaseConfigured) return null
  const { auth } = await loadAuth()
  return auth.currentUser ? auth.currentUser.getIdToken() : null
}

// Friendly messages for sign-in failures (never reveals whether the email exists).
export function signInErrorMessage(error) {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Could not reach the sign-in service. Check your connection and try again.'
    default:
      return error?.message || 'Sign-in failed. Please try again.'
  }
}
