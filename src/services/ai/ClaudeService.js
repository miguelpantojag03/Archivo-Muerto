// ─── ClaudeService ────────────────────────────────────────────────
// Calls the Anthropic Claude API directly from the browser.
// ⚠️  PRODUCTION WARNING: Never expose API keys in client-side code.
//     In production, route these calls through your own backend proxy.
//
// Model: claude-sonnet-4-5 (fast, cost-effective for short prompts)

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-5'
const MAX_TOKENS = 512

// ── Core request helper ───────────────────────────────────────────
async function callClaude(apiKey, systemPrompt, userMessage, signal) {
  const res = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            apiKey,
      'anthropic-version':    '2023-06-01',
      // Required for direct browser calls (Anthropic allows this for prototypes)
      'anthropic-dangerous-direct-browser-access': 'true',
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
const SYSTEM = `You are an assistant for "Vestigio", a creative archive app where teams store discarded ideas (called relics). Your tone is thoughtful, concise and slightly poetic — never corporate. Respond ONLY with valid JSON, no markdown fences, no extra text.`

// ── Public API ────────────────────────────────────────────────────
function makeClaudeService(apiKey) {
  return {
    async suggestTags(title, description, category = 'NOTES', signal) {
      return callClaude(apiKey, SYSTEM,
        `Suggest 3 to 5 lowercase tags for this archived creative relic.
Title: "${title}"
Description: "${description}"
Category: ${category}
Return JSON: { "tags": ["tag1","tag2","tag3"] }`,
        signal)
    },

    async enhanceDescription(title, description, signal) {
      return callClaude(apiKey, SYSTEM,
        `Improve this description for an archived creative relic. Keep it under 200 characters. Be specific about why it was discarded and what value it retains.
Title: "${title}"
Current description: "${description || 'No description yet.'}"
Return JSON: { "description": "improved text here" }`,
        signal)
    },

    async analyzeRelic(relic, signal) {
      return callClaude(apiKey, SYSTEM,
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

    async archiveInsights(relics, signal) {
      // Send lightweight summaries (no blobs, no base64)
      const summaries = relics.slice(0, 30).map(r => ({
        id: r.id, title: r.title, category: r.category,
        description: r.description?.slice(0, 80),
        revived: r.revived, discardedAt: r.discardedAt,
      }))
      return callClaude(apiKey, SYSTEM,
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
