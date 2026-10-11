const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey
  && firebaseConfig.authDomain
  && firebaseConfig.projectId
  && firebaseConfig.appId,
)

let authPromise = null

async function loadAuth() {
  if (!firebaseConfigured) throw new Error('Firebase sign-in is not configured.')
  authPromise ??= (async () => {
    const [{ initializeApp }, { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
    ])
    const app = initializeApp(firebaseConfig, 'qlugen-cms')
    const auth = getAuth(app)
    return { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut }
  })()
  return authPromise
}

export async function watchUser(callback) {
  const { auth, onAuthStateChanged } = await loadAuth()
  return onAuthStateChanged(auth, callback)
}

export async function signIn(email, password) {
  const { auth, signInWithEmailAndPassword } = await loadAuth()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user.getIdToken(true)
}

export async function signOut() {
  if (!firebaseConfigured) return
  const { auth, signOut: firebaseSignOut } = await loadAuth()
  await firebaseSignOut(auth)
}

export async function currentIdToken() {
  if (!firebaseConfigured) return null
  const { auth } = await loadAuth()
  return auth.currentUser ? auth.currentUser.getIdToken(true) : null
}

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
      return 'Could not reach Firebase Auth. Check your connection and try again.'
    default:
      return error?.message || 'Sign-in failed. Please try again.'
  }
}
