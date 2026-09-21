// ─── Simulated password hashing ────────────────────────────────────
// ⚠️  PRODUCTION WARNING: This is a deterministic mock hash for demo
//     purposes only. In production, NEVER store passwords client-side.
//     Use a real backend (Supabase Auth, Firebase Auth, etc.) where
//     hashing is done server-side with bcrypt/argon2.

export function hashPassword(password) {
  // Simple deterministic transform: base64 + salt prefix
  // NOT cryptographically secure — demo only.
  const salted = `AM_SALT_2024::${password}`
  return btoa(unescape(encodeURIComponent(salted)))
}

export function verifyPassword(password, hash) {
  return hashPassword(password) === hash
}
