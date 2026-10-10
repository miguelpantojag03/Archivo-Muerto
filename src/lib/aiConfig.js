// ─── aiConfig ─────────────────────────────────────────────────────
// Whether real AI (via backend/ — see its own header comment) is
// configured for this build. Replaces the old "does the user have an
// API key saved" check now that there's no per-user key anymore.

export function hasAIProxy() {
  return Boolean(import.meta.env.VITE_AI_PROXY_URL)
}
