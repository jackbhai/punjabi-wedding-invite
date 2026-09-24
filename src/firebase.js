// ── Firebase layer (Firestore + Auth, v10 modular).
// NEVER crashes without Firebase: every helper returns null/fallback when
// no config is present or the network is down. Public page always renders
// with built-in defaults; admin falls back to localStorage ("Offline mode").

const FB_KEY = 'wed-invite-fb' // localStorage key for firebaseConfig JSON
const CFG_KEY = 'wed-invite-config' // localStorage fallback for site/config

let _fb = null // { app, db, auth } | null
let _tried = false

import { DEFAULT_FIREBASE_CONFIG, hasBakedConfig } from './firebase.config.js'

function readConfigJSON() {
  // Priority: Settings override (localStorage) → hosting injection →
  // baked-in default from firebase.config.js.
  try {
    const raw = localStorage.getItem(FB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.apiKey) return parsed
    }
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__?.apiKey) {
    return window.__FIREBASE_CONFIG__
  }
  if (hasBakedConfig()) return DEFAULT_FIREBASE_CONFIG
  return null
}

export function hasFirebaseConfig() {
  return !!readConfigJSON()
}

// Lazily inits Firebase on first use. Returns null when unconfigured.
export async function getFirebase() {
  if (_tried) return _fb
  _tried = true
  try {
    const cfg = readConfigJSON()
    if (!cfg || !cfg.apiKey) return null
    const { initializeApp } = await import('firebase/app')
    const { getFirestore } = await import('firebase/firestore')
    const { getAuth } = await import('firebase/auth')
    const app = initializeApp(cfg)
    _fb = { app, db: getFirestore(app), auth: getAuth(app) }
    return _fb
  } catch (e) {
    console.warn('[firebase] init failed, running offline:', e?.message)
    return null
  }
}

// ── site/config ─────────────────────────────────────────────

export async function loadConfig() {
  // Returns Firestore config merged over defaults, or null on any failure.
  try {
    const fb = await getFirebase()
    if (!fb) return null
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(fb.db, 'site', 'config'))
    return snap.exists() ? snap.data() : {}
  } catch (e) {
    console.warn('[firebase] loadConfig failed:', e?.message)
    return null
  }
}

export async function saveConfigDoc(partial) {
  // merge write → returns 'cloud' | 'local' | 'failed'
  try {
    const fb = await getFirebase()
    if (fb) {
      const { doc, setDoc } = await import('firebase/firestore')
      await setDoc(doc(fb.db, 'site', 'config'), partial, { merge: true })
      return 'cloud'
    }
  } catch (e) {
    console.warn('[firebase] saveConfigDoc cloud failed:', e?.message)
  }
  try {
    const raw = localStorage.getItem(CFG_KEY)
    const cur = raw ? JSON.parse(raw) : {}
    const { mergeConfig } = await import('./defaultConfig.js')
    localStorage.setItem(CFG_KEY, JSON.stringify(mergeConfig(cur, partial)))
    return 'local'
  } catch {
    return 'failed'
  }
}

export function loadLocalConfig() {
  try {
    const raw = localStorage.getItem(CFG_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── guestLinks ──────────────────────────────────────────────

export async function getGuestLink(token) {
  if (!token) return null
  try {
    const fb = await getFirebase()
    if (!fb) return null
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(fb.db, 'site', 'guestLinks', token))
    return snap.exists() ? { token, ...snap.data() } : null
  } catch (e) {
    console.warn('[firebase] getGuestLink failed:', e?.message)
    return null
  }
}

export async function touchGuestLink(token) {
  // Increment openCount + lastOpenedAt — only once per session per token.
  if (!token) return
  try {
    const seen = sessionStorage.getItem('wed-opened-' + token)
    if (seen) return
    sessionStorage.setItem('wed-opened-' + token, '1')
    const fb = await getFirebase()
    if (!fb) return
    const { doc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore')
    await updateDoc(doc(fb.db, 'site', 'guestLinks', token), {
      openCount: increment(1),
      lastOpenedAt: serverTimestamp(),
    })
  } catch (e) {
    console.warn('[firebase] touchGuestLink failed:', e?.message)
  }
}

export async function listGuestLinks() {
  try {
    const fb = await getFirebase()
    if (!fb) return []
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
    let snap
    try {
      snap = await getDocs(query(collection(fb.db, 'site', 'guestLinks'), orderBy('createdAt', 'desc')))
    } catch {
      snap = await getDocs(collection(fb.db, 'site', 'guestLinks'))
    }
    return snap.docs.map((d) => ({ token: d.id, ...d.data() }))
  } catch (e) {
    console.warn('[firebase] listGuestLinks failed:', e?.message)
    return []
  }
}

export async function createGuestLink({ token, name, note, withFamily }) {
  const fb = await getFirebase()
  if (!fb) throw new Error('Firebase not configured')
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(doc(fb.db, 'site', 'guestLinks', token), {
    name: name || '',
    note: note || '',
    withFamily: !!withFamily,
    openCount: 0,
    createdAt: serverTimestamp(),
    lastOpenedAt: null,
  })
}

export async function deleteGuestLink(token) {
  const fb = await getFirebase()
  if (!fb) throw new Error('Firebase not configured')
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(fb.db, 'site', 'guestLinks', token))
}

// ── RSVPs ───────────────────────────────────────────────────

export async function addRSVP({ name, attending, guests, message }) {
  const fb = await getFirebase()
  if (!fb) return 'local'
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  await addDoc(collection(fb.db, 'site', 'rsvps'), {
    name: name || '',
    attending: attending === 'yes' ? 'yes' : 'no',
    guests: Number(guests) || 1,
    message: message || '',
    createdAt: serverTimestamp(),
  })
  return 'cloud'
}

export async function listRSVPs() {
  try {
    const fb = await getFirebase()
    if (!fb) return []
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
    let snap
    try {
      snap = await getDocs(query(collection(fb.db, 'site', 'rsvps'), orderBy('createdAt', 'desc')))
    } catch {
      snap = await getDocs(collection(fb.db, 'site', 'rsvps'))
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.warn('[firebase] listRSVPs failed:', e?.message)
    return []
  }
}

// ── Auth (admin only) ───────────────────────────────────────

export async function adminSignIn(email, password) {
  const fb = await getFirebase()
  if (!fb) throw new Error('Firebase not configured — add it in Settings first.')
  const { signInWithEmailAndPassword } = await import('firebase/auth')
  const cred = await signInWithEmailAndPassword(fb.auth, email, password)
  return cred.user
}

export async function adminSignOut() {
  try {
    const fb = await getFirebase()
    if (!fb) return
    const { signOut } = await import('firebase/auth')
    await signOut(fb.auth)
  } catch {
    /* ignore */
  }
}

export function onAdminAuthChange(cb) {
  getFirebase().then(async (fb) => {
    if (!fb) return cb(null)
    const { onAuthStateChanged } = await import('firebase/auth')
    onAuthStateChanged(fb.auth, (u) => cb(u))
  })
}

// ── Settings helpers ────────────────────────────────────────

export function saveFirebaseConfigJSON(jsonText) {
  const parsed = JSON.parse(jsonText) // throws on invalid JSON
  if (!parsed.apiKey || !parsed.projectId) {
    throw new Error('Config needs at least apiKey + projectId')
  }
  localStorage.setItem(FB_KEY, JSON.stringify(parsed))
  _fb = null
  _tried = false
  return parsed
}

export function clearFirebaseConfig() {
  try {
    localStorage.removeItem(FB_KEY)
  } catch {
    /* ignore */
  }
  _fb = null
  _tried = false
}
