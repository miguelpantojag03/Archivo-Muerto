// ─── Relic categories ─────────────────────────────────────────────

export const CATEGORIES = ['SKETCH', 'COPYWRITING', 'PALETTE', 'BRANDING', 'NOTES']

// Maps category → filter group used by TopBar
export const CATEGORY_FILTER_MAP = {
  SKETCH:      'visuals',
  COPYWRITING: 'drafts',
  PALETTE:     'visuals',
  BRANDING:    'visuals',
  NOTES:       'drafts',
}

// Maps category → thumbnail key used by Thumbnails.jsx
export const CATEGORY_THUMB_MAP = {
  SKETCH:      'sketch',
  COPYWRITING: 'copy',
  PALETTE:     'palette',
  BRANDING:    'branding',
  NOTES:       'notes',
}

export const RELIC_STATUSES = ['archived', 'revived', 'pinned']
