// ─── MockAuthService ───────────────────────────────────────────────
// ⚠️  PRODUCTION WARNING: This is a LOCAL mock that stores data in
//     the browser's localStorage. NEVER use this in production.
//     Replace with a real backend (Supabase, Firebase, custom API)
//     that handles auth server-side with secure password hashing.

import { hashPassword, verifyPassword } from '../lib/hash.js'
import { storageGetLocal, storageSetLocal } from '../lib/storage.js'

const USERS_KEY   = 'am_users'
const SESSION_KEY = 'am_session'
const SESSION_DAYS = 7

// ── Pre-load demo user ────────────────────────────────────────────
const DEMO_USER = {
  id: 'user_demo_001',
  email: 'julian@archivomuerto.com',
  fullName: 'Julian Archivo',
  plan: 'Pro Plan',
  avatarInitials: 'JA',
  activeProject: 'Nebula System',
  activeProjectInitials: 'NS',
}

function ensureDemoUser() {
  const users = storageGetLocal(USERS_KEY) || {}
  if (!users[DEMO_USER.email]) {
    users[DEMO_USER.email] = {
      ...DEMO_USER,
      passwordHash: hashPassword('Demo1234!'),
    }
    storageSetLocal(USERS_KEY, users)
  }
}

function delay(ms = 600) {
  return new Promise(r => setTimeout(r, ms))
}

function makeInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function makeProjectInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function makeSession(user, persistent) {
  return {
    user,
    expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    persistent,
  }
}

// ── Listeners ─────────────────────────────────────────────────────
const listeners = new Set()
function notifyListeners(session) {
  listeners.forEach(fn => fn(session))
}

// ── Public API ────────────────────────────────────────────────────
const MockAuthService = {
  async signIn(email, password, remember = true) {
    await delay()
    ensureDemoUser()
    const users = storageGetLocal(USERS_KEY) || {}
    const record = users[email.toLowerCase()]
    if (!record || !verifyPassword(password, record.passwordHash)) {
      throw new Error('Invalid email or password.')
    }
    const { passwordHash: _, ...user } = record
    const session = makeSession(user, remember)
    const store = remember ? localStorage : sessionStorage
    store.setItem(SESSION_KEY, JSON.stringify(session))
    notifyListeners(session)
    return session
  },

  async signUp(email, password, fullName) {
    await delay()
    ensureDemoUser()
    const users = storageGetLocal(USERS_KEY) || {}
    const key = email.toLowerCase()
    if (users[key]) throw new Error('An account with this email already exists.')
    const id = `user_${Date.now()}`
    const initials = makeInitials(fullName)
    const user = {
      id,
      email: key,
      fullName,
      plan: 'Free Plan',
      avatarInitials: initials,
      activeProject: '',
      activeProjectInitials: '',
    }
    users[key] = { ...user, passwordHash: hashPassword(password) }
    storageSetLocal(USERS_KEY, users)
    // Don't create a session yet — user must complete onboarding first
    return user
  },

  async signOut() {
    await delay(200)
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    notifyListeners(null)
  },

  async getSession() {
    ensureDemoUser()
    const raw =
      localStorage.getItem(SESSION_KEY) ||
      sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    try {
      const session = JSON.parse(raw)
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_KEY)
        return null
      }
      return session
    } catch { return null }
  },

  async resetPassword(email) {
    await delay()
    ensureDemoUser()
    const users = storageGetLocal(USERS_KEY) || {}
    if (!users[email.toLowerCase()]) {
      // Don't reveal whether the email exists — just succeed silently
    }
    // In a real app this would send an email via the backend
    return true
  },

  async setActiveProject(userId, projectName) {
    const users = storageGetLocal(USERS_KEY) || {}
    const record = Object.values(users).find(u => u.id === userId)
    if (!record) return
    record.activeProject = projectName
    record.activeProjectInitials = makeProjectInitials(projectName)
    users[record.email] = record
    storageSetLocal(USERS_KEY, users)

    // Also update the stored session
    const rawLS = localStorage.getItem(SESSION_KEY)
    const rawSS = sessionStorage.getItem(SESSION_KEY)
    const raw = rawLS || rawSS
    if (raw) {
      const session = JSON.parse(raw)
      session.user.activeProject = projectName
      session.user.activeProjectInitials = makeProjectInitials(projectName)
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
