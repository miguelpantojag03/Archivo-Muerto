// ─── useAI ────────────────────────────────────────────────────────
// Selects ClaudeService or MockAIService based on whether the user
// has configured an API key.  Manages loading, error and abort.

import { useState, useCallback, useRef } from 'react'
import { getAIKey, hasAIKey }    from '../lib/aiKeyStorage.js'
import MockAIService              from '../services/ai/MockAIService.js'
import makeClaudeService          from '../services/ai/ClaudeService.js'

function getService() {
  if (hasAIKey()) return makeClaudeService(getAIKey())
  return MockAIService
}

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const abortRef = useRef(null)

  function abort() {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null }
  }

  const run = useCallback(async (fn) => {
    abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError(null)
    try {
      const result = await fn(getService(), ctrl.signal)
      return result
    } catch (err) {
      if (err.name === 'AbortError') return null
      const msg = err.message?.includes('API error 401')
        ? 'Invalid API key. Check your settings.'
        : err.message?.includes('API error 429')
        ? 'Rate limit reached. Try again in a moment.'
        : err.message ?? 'AI request failed. Try again.'
      setError(msg)
      return null
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [])

  // ── Feature helpers ───────────────────────────────────────────
  const suggestTags = useCallback((title, description, category) =>
    run((svc, sig) => svc.suggestTags(title, description, category, sig)),
  [run])

  const enhanceDescription = useCallback((title, description) =>
    run((svc, sig) => svc.enhanceDescription(title, description, sig)),
  [run])

  const analyzeRelic = useCallback((relic) =>
    run((svc, sig) => svc.analyzeRelic(relic, sig)),
  [run])

  const archiveInsights = useCallback((relics) =>
    run((svc, sig) => svc.archiveInsights(relics, sig)),
  [run])

  return { loading, error, abort, suggestTags, enhanceDescription, analyzeRelic, archiveInsights }
}
