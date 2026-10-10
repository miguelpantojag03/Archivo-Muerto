// ─── vestigio-ai-proxy ────────────────────────────────────────────
// Stateless proxy in front of Anthropic's Messages API. Exists for one
// reason: the real Anthropic API key must never live in the public
// Vestigio repo or client bundle. This Worker holds it as a Cloudflare
// secret instead, and only forwards requests that carry a shared
// secret the app also knows (APP_SHARED_SECRET) — not a real API key
// of its own, just a cheap filter against casual/scripted abuse of
// the public endpoint. It stores nothing, logs nothing beyond
// Cloudflare's own request logs, and knows nothing about users.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-app-secret',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
    }
    if (request.headers.get('x-app-secret') !== env.APP_SHARED_SECRET) {
      return new Response('Forbidden', { status: 403, headers: CORS_HEADERS })
    }

    const body = await request.text()
    const anthropicRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body,
    })

    return new Response(anthropicRes.body, {
      status: anthropicRes.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  },
}
