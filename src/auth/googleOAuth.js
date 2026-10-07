// ─── googleOAuth ──────────────────────────────────────────────────
// Authorization Code + PKCE flow for a desktop app with no backend.
// Google blocks OAuth inside any embedded WebView (including Tauri's),
// so the consent screen opens in the system's real browser; the
// redirect comes back through a local loopback server instead of a
// custom URL scheme — Google's own recommended pattern for the
// "Desktop app" OAuth client type, and it needs no redirect URI to be
// pre-registered in Google Cloud Console.
//
// The loopback server itself is tauri-plugin-oauth, a community plugin
// (not an official Tauri one) — see the project notes on this tradeoff.

import { start, cancel, onUrl } from '@fabianlars/tauri-plugin-oauth'
import { openUrl } from '@tauri-apps/plugin-opener'
import { fetch } from '@tauri-apps/plugin-http'

// Public OAuth client ID — not a secret, meant to live in app code
// (unlike a client secret, which this PKCE flow never needs or sends).
// Replace with the real value from Google Cloud Console > Google Auth
// Platform > Clients > a "Desktop app" type OAuth client.
export const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com'

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const SCOPE = 'openid email profile'
const TIMEOUT_MS = 5 * 60 * 1000 // 5 min to complete consent in the browser

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomString(len = 64) {
  return base64url(crypto.getRandomValues(new Uint8Array(len)))
}

async function codeChallengeFor(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64url(new Uint8Array(digest))
}

function decodeIdToken(idToken) {
  const payloadB64 = idToken.split('.')[1]
  const bytes = Uint8Array.from(
    atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')),
    c => c.charCodeAt(0)
  )
  return JSON.parse(new TextDecoder('utf-8').decode(bytes))
}

function oauthError(message, code) {
  return Object.assign(new Error(message), { code })
}

/**
 * Runs the full Google sign-in flow and returns the signed-in person's
 * basic profile. Never touches app auth state — callers decide what to
 * do with the profile (see MockAuthService.signInWithGoogle).
 * @returns {Promise<{email: string, name: string, picture: string, sub: string}>}
 */
export async function getGoogleProfile() {
  const verifier = randomString()
  const challenge = await codeChallengeFor(verifier)
  const state = randomString(32)

  const port = await start()
  let unlisten
  try {
    const redirectUri = `http://127.0.0.1:${port}`
    const authUrl = `${AUTH_ENDPOINT}?${new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPE,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
    })}`
    await openUrl(authUrl)

    const callbackUrl = await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(oauthError('Timed out waiting for Google sign-in.', 'timeout')),
        TIMEOUT_MS
      )
      onUrl(url => { clearTimeout(timer); resolve(url) }).then(fn => { unlisten = fn })
    })

    const params = new URL(callbackUrl).searchParams
    if (params.get('error')) throw oauthError('Google sign-in was denied.', 'denied')
    if (params.get('state') !== state) throw oauthError('OAuth state mismatch.', 'state_mismatch')
    const code = params.get('code')

    const tokenRes = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: GOOGLE_CLIENT_ID,
        code_verifier: verifier,
      }).toString(),
    })
    if (!tokenRes.ok) throw oauthError('Could not exchange the Google auth code.', 'network')
    const { id_token } = await tokenRes.json()

    const payload = decodeIdToken(id_token)
    if (payload.aud !== GOOGLE_CLIENT_ID) throw oauthError('Invalid Google token.', 'invalid_token')
    if (payload.exp * 1000 < Date.now()) throw oauthError('Expired Google token.', 'invalid_token')

    return { email: payload.email, name: payload.name, picture: payload.picture, sub: payload.sub }
  } finally {
    unlisten?.()
    await cancel(port).catch(() => {})
  }
}
