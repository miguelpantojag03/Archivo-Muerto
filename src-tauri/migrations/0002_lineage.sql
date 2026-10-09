-- Linaje de ideas: "reemplaza a" / "inspirada en" otra reliquia.
-- Nullable y auto-referenciadas — ninguna fila existente se ve afectada.
ALTER TABLE relics ADD COLUMN replaces_id    TEXT REFERENCES relics(id);
ALTER TABLE relics ADD COLUMN inspired_by_id TEXT REFERENCES relics(id);
