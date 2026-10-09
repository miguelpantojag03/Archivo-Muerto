-- Borradores: variantes en desarrollo de una idea activa, antes de
-- "promoverse" a contenido oficial. Uno-a-muchos real con relics,
-- igual de patrón que attachments.
CREATE TABLE IF NOT EXISTS drafts (
  id              TEXT PRIMARY KEY,
  relic_id        TEXT NOT NULL REFERENCES relics(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  label           TEXT,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  notes           TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','archived')),
  archived_reason TEXT,
  origin_draft_id TEXT REFERENCES drafts(id),
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_drafts_relic_id ON drafts(relic_id);
