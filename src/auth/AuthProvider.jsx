import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import MockAuthService from './MockAuthService.js'

// Swap MockAuthService for SupabaseAuthService / FirebaseAuthService here
const authService = MockAuthService

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,   setUser]   = useState(null)
  const [status, setStatus] = useState('loading') // 'loading'|'authenticated'|'unauthenticated'
  const timerRef            = useRef(null)

  // Schedule automatic sign-out when the session expires
  function scheduleExpiry(session, signOutFn) {
    clearTimeout(timerRef.current)
    const msLeft = session.expiresAt - Date.now()
    if (msLeft <= 0) { signOutFn(); return }
    timerRef.current = setTimeout(() => {
      signOutFn()
      // The toast message is emitted from a custom event so any component can listen
      window.dispatchEvent(new CustomEvent('am:session-expired'))
    }, msLeft)
  }

  const doSignOut = useCallback(async () => {
    clearTimeout(timerRef.current)
    await authService.signOut()
  }, [])

  // Restore session on mount
  useEffect(() => {
    authService.getSession().then(session => {
      if (session) {
        setUser(session.user)
        setStatus('authenticated')
        scheduleExpiry(session, doSignOut)
      } else {
        setStatus('unauthenticated')
      }
    })

    const unsub = authService.onAuthStateChange(session => {
      if (session) {
        setUser(session.user)
        setStatus('authenticated')
        scheduleExpiry(session, doSignOut)
      } else {
        setUser(null)
        setStatus('unauthenticated')
        clearTimeout(timerRef.current)
      }
    })

    return () => { unsub(); clearTimeout(timerRef.current) }
  }, [doSignOut])

  const signIn = useCallback((email, password, remember) =>
    authService.signIn(email, password, remember), [])

  const signUp = useCallback((email, password, fullName) =>
    authService.signUp(email, password, fullName), [])

  const signOut      = doSignOut
  const resetPassword = useCallback(email => authService.resetPassword(email), [])

  const setActiveProject = useCallback((projectName) => {
    if (!user) return
    return authService.setActiveProject(user.id, projectName)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, status, signIn, signUp, signOut, resetPassword, setActiveProject }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
