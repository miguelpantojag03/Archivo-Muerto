// ─── MockAuthService ───────────────────────────────────────────────
// ⚠️  PRODUCTION WARNING: This is a LOCAL mock that stores data in
//     the browser's localStorage. NEVER use this in production.
//     Replace with a real backend (Supabase, Firebase, custom API)
//     that handles auth server-side with secure password hashing.

import { hashPassword, verifyPassword, migrateOldHash } from '../lib/hash.js'
import { storageGetLocal, storageSetLocal }              from '../lib/storage.js'
import { USERS_KEY, SESSION_KEY }                        from '../constants/storageKeys.js'

const SESSION_DAYS = 7

// ── Demo user ──────────────────────────────────────────────────────
const DEMO_USER = {
  id:                    'user_demo_001',
  email:                 'julian@archivomuerto.com',
  fullName:              'Julian Archivo',
  plan:                  'Pro Plan',
  avatarInitials:        'JA',
  activeProject:         'Nebula System',
  activeProjectInitials: 'NS',
}

// ensureDemoUser runs ONCE at module initialisation, not on every call.
let _demoReady = false
async function ensureDemoUser() {
  if (_demoReady) return
  _demoReady = true
  const users = storageGetLocal(USERS_KEY) || {}
  if (!users[DEMO_USER.email]) {
    users[DEMO_USER.email] = {
      ...DEMO_USER,
      passwordHash:  await hashPassword('Demo1234!'),
      __hashVersion: 2,
    }
    storageSetLocal(USERS_KEY, users)
  } else {
    // Migrate old btoa hash if needed
    const migrated = await migrateOldHash(users[DEMO_USER.email])
    if (migrated.__hashVersion === 2) {
      users[DEMO_USER.email] = migrated
      storageSetLocal(USERS_KEY, users)
    }
  }
}

// Kick off immediately (fire-and-forget — awaited inside methods)
const _demoInit = ensureDemoUser()

// ── Helpers ────────────────────────────────────────────────────────
function delay(ms = 600) { return new Promise(r => setTimeout(r, ms)) }

function makeInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function makeSession(user, persistent) {
  return {
    user,
    expiresAt:  Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    persistent,
  }
}

// ── Auth state listeners ───────────────────────────────────────────
const listeners = new Set()
function notifyListeners(session) { listeners.forEach(fn => fn(session)) }

// ── Public API ─────────────────────────────────────────────────────
const MockAuthService = {

  async signIn(email, password, remember = true) {
    await _demoInit           // ensure demo user is ready
    await delay()
    const users  = storageGetLocal(USERS_KEY) || {}
    const record = users[email.toLowerCase()]
    if (!record || !(await verifyPassword(password, record.passwordHash))) {
      throw new Error('Invalid email or password.')
    }
    const { passwordHash: _, __hashVersion: __, ...user } = record
    const session = makeSession(user, remember)
    const store   = remember ? localStorage : sessionStorage
    store.setItem(SESSION_KEY, JSON.stringify(session))
    notifyListeners(session)
    return session
  },

  async signUp(email, password, fullName) {
    await _demoInit
    await delay()
    const users = storageGetLocal(USERS_KEY) || {}
    const key   = email.toLowerCase()
    if (users[key]) throw new Error('An account with this email already exists.')
    const user = {
      id:                    `user_${Date.now()}`,
      email:                 key,
      fullName,
      plan:                  'Free Plan',
      avatarInitials:        makeInitials(fullName),
      activeProject:         '',
      activeProjectInitials: '',
    }
    users[key] = { ...user, passwordHash: await hashPassword(password), __hashVersion: 2 }
    storageSetLocal(USERS_KEY, users)
    // Return user — NO session yet (onboarding will create it via signIn)
    return user
  },

  async signOut() {
    await delay(150)
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    notifyListeners(null)
  },

  async getSession() {
    await _demoInit
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    try {
      const session = JSON.parse(raw)
      if (Date.now() > session.expiresAt) {
        // Expired — clean up and return null so AuthProvider can redirect
        localStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_KEY)
        return null
      }
      return session
    } catch { return null }
  },

  async resetPassword(_email) {
    await _demoInit
    await delay()
    // In a real app this sends an email. We always succeed silently.
    return true
  },

  async setActiveProject(userId, projectName) {
    const users  = storageGetLocal(USERS_KEY) || {}
    const record = Object.values(users).find(u => u.id === userId)
    if (!record) return
    const initials = makeInitials(projectName)
    record.activeProject         = projectName
    record.activeProjectInitials = initials
    users[record.email]          = record
    storageSetLocal(USERS_KEY, users)
    // Patch live session
    const rawLS = localStorage.getItem(SESSION_KEY)
    const rawSS = sessionStorage.getItem(SESSION_KEY)
    const raw   = rawLS || rawSS
    if (raw) {
      const session = JSON.parse(raw)
      session.user.activeProject         = projectName
      session.user.activeProjectInitials = initials
      const store = rawLS ? localStorage : sessionStorage
      store.setItem(SESSION_KEY, JSON.stringify(session))
      notifyListeners(session)
    }
  },

  onAuthStateChange(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },
}

export default MockAuthService
