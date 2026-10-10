// ─── vestigio-ai-proxy ────────────────────────────────────────────
// Thin gate in front of Cloudflare Workers AI (env.AI binding — see
// wrangler.toml). No external API key to protect: Workers AI runs
// in-account on Cloudflare's free tier. The only thing this Worker
// guards against is casual/scripted abuse of the public endpoint,
// via a shared secret the app also knows (APP_SHARED_SECRET). It
// stores nothing, logs nothing beyond Cloudflare's own request logs,
// and knows nothing about users.
//
// Request/response shape is kept the same as the Anthropic Messages
// API this Worker used to proxy ({ system, messages, max_tokens } in,
// { content: [{ text }] } out) so the frontend (RealAIService.js)
// doesn't need to know which model is actually answering — only this
// file needs to change if the model is swapped again later.

const MODEL = '@cf/meta/llama-3.1-8b-instruct'

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

    let payload
    try {
      payload = await request.json()
    } catch {
      return new Response(
        JSON.stringify({ error: { message: 'Invalid JSON body' } }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      )
    }

    const { system, messages, max_tokens } = payload
    const userMessage = messages?.[0]?.content ?? ''

    try {
      const result = await env.AI.run(MODEL, {
        messages: [
          { role: 'system', content: system ?? '' },
          { role: 'user', content: userMessage },
        ],
        max_tokens: max_tokens ?? 512,
      })

      return new Response(
        JSON.stringify({ content: [{ text: result?.response ?? '' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      )
    } catch (err) {
      return new Response(
        JSON.stringify({ error: { message: String(err?.message ?? err) } }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      )
    }
  },
}
