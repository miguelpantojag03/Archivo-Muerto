-- Se quita la función de bifurcación (Crear Variante). SQLite no permite
-- ALTER TABLE ... DROP COLUMN sobre una columna que forma parte de un
-- FOREIGN KEY, así que se reconstruye la tabla completa copiando todas
-- las demás columnas tal cual — no se pierde ningún otro dato.
--
-- Las columnas replaces_id/inspired_by_id/project_id quedan sin la
-- cláusula REFERENCES explícita: la app nunca dependió de que SQLite
-- la hiciera cumplir (las conexiones del pool no garantizan
-- PRAGMA foreign_keys=ON — ver relicStorage.js), así que quitarla aquí
-- es puramente cosmético y evita cualquier duda sobre cómo SQLite
-- reescribe las referencias propias de la tabla al renombrarla.

-- La vista depende de relics — SQLite no permite DROP TABLE mientras
-- una vista la referencia. Se borra y se recrea idéntica al final.
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
  replaces_id             TEXT,
  inspired_by_id          TEXT,
  linked_file_path        TEXT,
  linked_file_mtime       TEXT,
  linked_file_copied_path TEXT,
  project_id              TEXT
);

INSERT INTO relics_new (
  id, user_id, category, title, description, notes, responsible, project,
  filter, thumbnail, cover_image_path, tags, status, revived_at,
  created_at, discarded_at, updated_at, replaces_id, inspired_by_id,
  linked_file_path, linked_file_mtime, linked_file_copied_path, project_id
)
SELECT
  id, user_id, category, title, description, notes, responsible, project,
  filter, thumbnail, cover_image_path, tags, status, revived_at,
  created_at, discarded_at, updated_at, replaces_id, inspired_by_id,
  linked_file_path, linked_file_mtime, linked_file_copied_path, project_id
FROM relics;

DROP TABLE relics;
ALTER TABLE relics_new RENAME TO relics;

CREATE INDEX IF NOT EXISTS idx_relics_user_id ON relics(user_id);
CREATE INDEX IF NOT EXISTS idx_relics_project_id ON relics(project_id);

-- Idéntica a la original (0001_init.sql) — r.* ahora resuelve sin forked_from_id.
CREATE VIEW relics_with_counts AS
SELECT
  r.*,
  (SELECT COUNT(*) FROM relic_status_history h
     WHERE h.relic_id = r.id AND h.to_status = 'revived') AS revival_count
FROM relics r;
