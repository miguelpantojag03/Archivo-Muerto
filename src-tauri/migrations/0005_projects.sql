-- Proyectos reales (antes "project" era solo texto libre en relics).
CREATE TABLE IF NOT EXISTS projects (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

ALTER TABLE relics ADD COLUMN project_id TEXT REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_relics_project_id ON relics(project_id);

-- Backfill sin pérdida de datos: un proyecto real por cada valor distinto
-- de relics.project que ya exista por usuario (la vieja columna de texto
-- libre queda intacta, solo deja de usarse para mostrar).
INSERT INTO projects (id, user_id, name, created_at, updated_at)
SELECT 'proj_' || lower(hex(randomblob(8))), user_id, project, datetime('now'), datetime('now')
FROM (SELECT DISTINCT user_id, project FROM relics WHERE project IS NOT NULL AND project != '');

UPDATE relics SET project_id = (
  SELECT p.id FROM projects p WHERE p.user_id = relics.user_id AND p.name = relics.project
) WHERE project_id IS NULL AND project IS NOT NULL AND project != '';
