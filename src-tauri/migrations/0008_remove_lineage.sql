-- Se quita la función de linaje ("reemplaza a" / "inspirada en"). Mismo
-- motivo y misma técnica que 0007_remove_fork.sql: replaces_id e
-- inspired_by_id eran parte de un FOREIGN KEY, así que SQLite no
-- permite DROP COLUMN directo — se reconstruye la tabla completa.

DROP VIEW IF EXISTS relics_with_counts;

CREATE TABLE relics_new (
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
  updated_at       TEXT NOT NULL,
  linked_file_path        TEXT,
  linked_file_mtime       TEXT,
  linked_file_copied_path TEXT,
  project_id              TEXT
);

INSERT INTO relics_new (
  id, user_id, category, title, description, notes, responsible, project,
  filter, thumbnail, cover_image_path, tags, status, revived_at,
  created_at, discarded_at, updated_at,
  linked_file_path, linked_file_mtime, linked_file_copied_path, project_id
)
SELECT
  id, user_id, category, title, description, notes, responsible, project,
  filter, thumbnail, cover_image_path, tags, status, revived_at,
  created_at, discarded_at, updated_at,
  linked_file_path, linked_file_mtime, linked_file_copied_path, project_id
FROM relics;

DROP TABLE relics;
ALTER TABLE relics_new RENAME TO relics;

CREATE INDEX IF NOT EXISTS idx_relics_user_id ON relics(user_id);
CREATE INDEX IF NOT EXISTS idx_relics_project_id ON relics(project_id);

CREATE VIEW relics_with_counts AS
SELECT
  r.*,
  (SELECT COUNT(*) FROM relic_status_history h
     WHERE h.relic_id = r.id AND h.to_status = 'revived') AS revival_count
FROM relics r;
