// ─── AIService interface ──────────────────────────────────────────
// All AI features go through this contract.
// Swap RealAIService for any other provider without touching the UI.
//
// @typedef {Object} TagSuggestion
// @property {string[]} tags
//
// @typedef {Object} RelicAnalysis
// @property {string} summary   — why it was discarded
// @property {string} potential — revival potential assessment
// @property {string[]} suggestions
//
// @typedef {Object} ArchiveInsights
// @property {string} overview
// @property {string[]} patterns
// @property {string[]} topRevivalCandidates  — relic ids
// @property {string} tip
//
// @typedef {Object} EnhancedDescription
// @property {string} description

// Methods every implementation must provide:
// suggestTags(title, description)  → Promise<TagSuggestion>
// enhanceDescription(title, description, notes) → Promise<EnhancedDescription>
// analyzeRelic(relic) → Promise<RelicAnalysis>
// archiveInsights(relics) → Promise<ArchiveInsights>
