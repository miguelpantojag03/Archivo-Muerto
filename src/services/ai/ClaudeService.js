// ─── ClaudeService ────────────────────────────────────────────────
// Calls Anthropic's Messages API through our own proxy (backend/),
// never directly — the real API key lives only as a Cloudflare secret
// server-side. VITE_AI_PROXY_URL/VITE_APP_SHARED_SECRET come from
// .env.local (gitignored), same pattern as googleOAuth.js's client
// secret. See backend/src/index.js for the other half of this.
//
// Model: claude-sonnet-4-5 (fast, cost-effective for short prompts)

const API_URL = import.meta.env.VITE_AI_PROXY_URL
const MODEL   = 'claude-sonnet-4-5'
const MAX_TOKENS = 512

// ── Core request helper ───────────────────────────────────────────
async function callClaude(systemPrompt, userMessage, signal) {
  const res = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-app-secret': import.meta.env.VITE_APP_SHARED_SECRET,
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system:     systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${res.status}`)
  }

  const data   = await res.json()
  const text   = data.content?.[0]?.text ?? ''
  // Strip any accidental markdown fences the model might add
  const clean  = text.replace(/^```(?:json)?\n?/,'').replace(/\n?```$/,'').trim()
  return JSON.parse(clean)
}

// ── System prompt shared by all features ──────────────────────────
// Lang-aware: without this, Claude defaults to English regardless of
// the app's own UI language — the JSON *keys* stay in English (the
// app parses them by name), only the natural-language *values* inside
// should switch.
const LANG_NAME = { es: 'Spanish', en: 'English' }

function systemPrompt(lang) {
  const languageName = LANG_NAME[lang?.slice(0, 2)] ?? LANG_NAME.en
  return `You are an assistant for "Vestigio", a creative archive app where teams store discarded ideas (called relics). Your tone is thoughtful, concise and slightly poetic — never corporate. Respond ONLY with valid JSON, no markdown fences, no extra text. Keep every JSON key in English exactly as given in the prompt, but write all natural-language text inside the JSON string values in ${languageName}.`
}

// ── Public API ────────────────────────────────────────────────────
function makeClaudeService() {
  return {
    async suggestTags(title, description, category = 'NOTES', lang, signal) {
      return callClaude(systemPrompt(lang),
        `Suggest 3 to 5 lowercase tags for this archived creative relic.
Title: "${title}"
Description: "${description}"
Category: ${category}
Return JSON: { "tags": ["tag1","tag2","tag3"] }`,
        signal)
    },

    async enhanceDescription(title, description, lang, signal) {
      return callClaude(systemPrompt(lang),
        `Improve this description for an archived creative relic. Keep it under 200 characters. Be specific about why it was discarded and what value it retains.
Title: "${title}"
Current description: "${description || 'No description yet.'}"
Return JSON: { "description": "improved text here" }`,
        signal)
    },

    async analyzeRelic(relic, lang, signal) {
      return callClaude(systemPrompt(lang),
        `Analyze this discarded creative relic and assess its revival potential.
Title: "${relic.title}"
Category: ${relic.category}
Description: "${relic.description}"
Notes: "${relic.notes || 'None'}"
Status: ${relic.revived ? 'Already revived' : 'Archived'}
Return JSON: {
  "summary": "one sentence on why it was likely discarded",
  "potential": "one sentence on revival potential",
  "suggestions": ["action 1", "action 2"]
}`,
        signal)
    },

    async archiveInsights(relics, lang, signal) {
      // Send lightweight summaries (no blobs, no base64)
      const summaries = relics.slice(0, 30).map(r => ({
        id: r.id, title: r.title, category: r.category,
        description: r.description?.slice(0, 80),
        revived: r.revived, discardedAt: r.discardedAt,
      }))
      return callClaude(systemPrompt(lang),
        `Analyze this team's creative archive and provide insights.
Archive (${relics.length} relics): ${JSON.stringify(summaries)}
Return JSON: {
  "overview": "2-3 sentence overview of the archive",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "topRevivalCandidates": ["relic_id_1", "relic_id_2"],
  "tip": "one actionable creative tip based on these patterns"
}`,
        signal)
    },
  }
}

export default makeClaudeService
