import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import MockAuthService from './MockAuthService.js'

// Swap MockAuthService for SupabaseAuthService / FirebaseAuthService here
const authService = MockAuthService

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'authenticated' | 'unauthenticated'

  // Restore session on mount
  useEffect(() => {
    authService.getSession().then(session => {
      if (session) {
        setUser(session.user)
        setStatus('authenticated')
      } else {
        setStatus('unauthenticated')
      }
    })

    const unsub = authService.onAuthStateChange(session => {
      if (session) {
        setUser(session.user)
        setStatus('authenticated')
      } else {
        setUser(null)
        setStatus('unauthenticated')
      }
    })
    return unsub
  }, [])

  const signIn = useCallback((email, password, remember) =>
    authService.signIn(email, password, remember), [])

  const signUp = useCallback((email, password, fullName) =>
    authService.signUp(email, password, fullName), [])

  const signOut = useCallback(() => authService.signOut(), [])

  const resetPassword = useCallback(email =>
    authService.resetPassword(email), [])

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
