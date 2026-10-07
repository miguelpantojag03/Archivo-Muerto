-- Archivo Muerto — esquema inicial (forward-only, el plugin solo ejecuta MigrationKind::Up)

CREATE TABLE IF NOT EXISTS relics (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL,
  category         TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  notes            TEXT NOT NULL DEFAULT '',
  responsible      TEXT NOT NULL DEFAULT '',
  project          TEXT NOT NULL DEFAULT '',
  filter           TEXT,
  thumbnail        TEXT,
  cover_image_path TEXT,
  tags             TEXT NOT NULL DEFAULT '[]',
  status           TEXT NOT NULL DEFAULT 'archived' CHECK (status IN ('archived','revived')),
  revived_at       TEXT,
  created_at       TEXT NOT NULL,
  discarded_at     TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_relics_user_id ON relics(user_id);

-- Una fila por transición. from_status NULL = creación inicial.
-- Hoy solo existen 'NULL->archived' y 'archived->revived'; el esquema
-- no necesita cambiar para soportar más transiciones a futuro.
CREATE TABLE IF NOT EXISTS relic_status_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  relic_id    TEXT NOT NULL REFERENCES relics(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  changed_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_status_history_relic_id ON relic_status_history(relic_id);

CREATE TABLE IF NOT EXISTS attachments (
  id            TEXT PRIMARY KEY,
  relic_id      TEXT NOT NULL REFERENCES relics(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL,
  original_name TEXT NOT NULL,
  extension     TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size          INTEGER NOT NULL,
  file_path     TEXT NOT NULL,
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attachments_relic_id ON attachments(relic_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id  ON attachments(user_id);

CREATE TABLE IF NOT EXISTS migration_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- El contador de revivals se deriva del historial, nunca se guarda/incrementa
-- directamente — una sola fuente de verdad.
CREATE VIEW IF NOT EXISTS relics_with_counts AS
SELECT
  r.*,
  (SELECT COUNT(*) FROM relic_status_history h
     WHERE h.relic_id = r.id AND h.to_status = 'revived') AS revival_count
FROM relics r;
