// ─── Password hashing ──────────────────────────────────────────────
// ⚠️  PRODUCTION WARNING: Passwords are stored client-side in
//     localStorage. NEVER use this in production. Replace with a
//     real backend (Supabase Auth, Firebase Auth, custom API) where
//     hashing is done server-side with bcrypt / argon2.
//
// Uses crypto.subtle (SHA-256) — available natively in all modern
// browsers without any dependency. NOT reversible like the old btoa().

const SALT_PREFIX = 'AM_SALT_2024::'

async function sha256hex(str) {
  const encoded = new TextEncoder().encode(str)
  const buf     = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Hash a plain-text password.
 * Returns a Promise<string> (hex SHA-256 of salt+password).
 */
export async function hashPassword(password) {
  return sha256hex(SALT_PREFIX + password)
}

/**
 * Compare a plain-text password against a stored hash.
 * Returns Promise<boolean>.
 */
export async function verifyPassword(password, storedHash) {
  const hash = await hashPassword(password)
  return hash === storedHash
}

// ─── One-time migration helper ─────────────────────────────────────
// The old mock used btoa() synchronously. We need to re-hash the demo
// user's password on first run with the new algorithm.
// This is safe to call multiple times — it checks before writing.
const OLD_DEMO_HASH = btoa(unescape(encodeURIComponent('AM_SALT_2024::Demo1234!')))

export async function migrateOldHash(userRecord) {
  if (userRecord.passwordHash === OLD_DEMO_HASH) {
    userRecord.passwordHash = await hashPassword('Demo1234!')
    userRecord.__hashVersion = 2
  }
  return userRecord
}
