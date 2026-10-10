// ─── useAI ────────────────────────────────────────────────────────
// Selects ClaudeService or MockAIService based on whether the AI
// proxy (backend/) is configured for this build. Manages loading,
// error and abort.

import { useState, useCallback, useRef } from 'react'
import { useTranslation }        from 'react-i18next'
import { hasAIProxy }            from '../lib/aiConfig.js'
import MockAIService              from '../services/ai/MockAIService.js'
import makeClaudeService          from '../services/ai/ClaudeService.js'

function getService() {
  if (hasAIProxy()) return makeClaudeService()
  return MockAIService
}

export function useAI() {
  const { t, i18n } = useTranslation()
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
      const result = await fn(getService(), i18n.language, ctrl.signal)
      return result
    } catch (err) {
      if (err.name === 'AbortError') return null
      const msg = err.message?.includes('API error 401')
        ? t('ai.errorInvalidKey')
        : err.message?.includes('API error 429')
        ? t('ai.errorRateLimit')
        : err.message ?? t('ai.errorGeneric')
      setError(msg)
      return null
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [i18n.language, t])

  // ── Feature helpers ───────────────────────────────────────────
  // Every service call gets the current UI language so AI-generated
  // text (real or mocked) matches it instead of always coming back
  // in English.
  const suggestTags = useCallback((title, description, category) =>
    run((svc, lang, sig) => svc.suggestTags(title, description, category, lang, sig)),
  [run])

  const enhanceDescription = useCallback((title, description) =>
    run((svc, lang, sig) => svc.enhanceDescription(title, description, lang, sig)),
  [run])

  const analyzeRelic = useCallback((relic) =>
    run((svc, lang, sig) => svc.analyzeRelic(relic, lang, sig)),
  [run])

  const archiveInsights = useCallback((relics) =>
    run((svc, lang, sig) => svc.archiveInsights(relics, lang, sig)),
  [run])

  return { loading, error, abort, suggestTags, enhanceDescription, analyzeRelic, archiveInsights }
}
