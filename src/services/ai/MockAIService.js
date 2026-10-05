// ─── MockAIService ────────────────────────────────────────────────
// Used when no API key is configured or during development.
// Returns realistic-looking responses with a simulated delay.
// Never makes network calls.

function delay(ms = 800) { return new Promise(r => setTimeout(r, ms)) }

function pickN(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

const TAG_BANK = {
  SKETCH:      ['layout', 'wireframe', 'ui', 'hero', 'concept', 'prototype'],
  COPYWRITING: ['brand-voice', 'tone', 'copy', 'headline', 'manifesto', 'tagline'],
  PALETTE:     ['color', 'accessibility', 'contrast', 'dark-mode', 'brand', 'typography'],
  BRANDING:    ['logo', 'identity', 'mark', 'icon', 'wordmark', 'visual'],
  NOTES:       ['brainstorm', 'ideas', 'research', 'ux', 'mobile', 'feedback'],
}

const MockAIService = {
  async suggestTags(title, description, category = 'NOTES') {
    await delay(900)
    const bank  = TAG_BANK[category] ?? TAG_BANK.NOTES
    const words = `${title} ${description}`.toLowerCase().split(/\W+/).filter(w => w.length > 3)
    // Mix some derived-from-content tags with bank tags
    const derived = words.filter(w => !['this', 'that', 'with', 'from', 'were', 'have', 'been'].includes(w)).slice(0, 2)
    return { tags: [...new Set([...pickN(bank, 3), ...derived])].slice(0, 5) }
  },

  async enhanceDescription(title, description) {
    await delay(1100)
    const enhanced = description && description.length > 20
      ? `${description} Originally shelved due to scope and timeline constraints, this concept retains strong potential as a future reference point for similar challenges.`
      : `This ${title.toLowerCase()} was explored during an intensive design sprint. While it didn't make the final cut, the core reasoning and visual direction remain valuable for future iterations.`
    return { description: enhanced }
  },

  async analyzeRelic(relic) {
    await delay(1200)
    const reasons = [
      'The design was ahead of the team\'s current technical capacity.',
      'Stakeholder priorities shifted before this could be fully validated.',
      'Accessibility concerns required a fundamental rethink of the approach.',
      'The scope grew beyond what the sprint timeline could accommodate.',
      'User testing revealed misalignment with mental models.',
    ]
    const potentials = [
      'High — the core concept solves a real problem; worth revisiting in Q3.',
      'Medium — needs refinement but the direction is sound.',
      'High — this was discarded for procedural, not conceptual, reasons.',
      'Medium — pair it with newer constraints for a stronger iteration.',
    ]
    const suggestions = [
      'Pair with current brand guidelines and re-evaluate.',
      `Explore a simplified version of "${relic.title}" for mobile-first contexts.`,
      'Share with the wider team — someone else may see the path forward.',
      'Tag as a reference for the next design sprint.',
    ]
    return {
      summary:     reasons[Math.floor(Math.random() * reasons.length)],
      potential:   potentials[Math.floor(Math.random() * potentials.length)],
      suggestions: pickN(suggestions, 2),
    }
  },

  async archiveInsights(relics) {
    await delay(1400)
    const cats   = relics.reduce((acc, r) => { acc[r.category] = (acc[r.category]||0)+1; return acc }, {})
    const topCat = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? 'SKETCH'
    const revivable = relics.filter(r => !r.revived).slice(0, 3).map(r => r.id)
    return {
      overview: `Your archive holds ${relics.length} relics across ${Object.keys(cats).length} categories. Most discarded ideas fall under ${topCat}, suggesting this is where your team experiments most boldly.`,
      patterns: [
        `${topCat} is your most active creative category — consider allocating dedicated revival sessions for it.`,
        'Ideas discarded for technical reasons tend to age well — technology changes, concepts don\'t.',
        `${relics.filter(r=>r.revived).length} relics have already been revived, showing your archive has real return on investment.`,
      ],
      topRevivalCandidates: revivable,
      tip: 'Review relics older than 90 days — distance often reveals value that urgency hides.',
    }
  },
}

export default MockAIService
