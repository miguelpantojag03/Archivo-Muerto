// ─── AuthService interface ─────────────────────────────────────────
// Swap this implementation for Supabase/Firebase by creating a new
// class that satisfies the same shape and injecting it via AuthProvider.

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} fullName
 * @property {string} plan
 * @property {string} avatarInitials
 * @property {string} activeProject
 * @property {string} activeProjectInitials
 */

/**
 * @typedef {Object} Session
 * @property {User} user
 * @property {number} expiresAt   - unix ms
 * @property {boolean} persistent
 */

// Interface contract (documentation only — JS has no interfaces)
// signIn(email, password, remember): Promise<Session>
// signUp(email, password, fullName): Promise<Session>
// signOut(): Promise<void>
// getSession(): Promise<Session|null>
// resetPassword(email): Promise<void>
// onAuthStateChange(callback): () => void  (returns unsubscribe fn)
