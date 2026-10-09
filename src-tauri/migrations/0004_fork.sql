-- Bifurcación: una idea nueva puede nacer "a partir de" una archivada,
-- sin tocar el status/contador de revivals de la original. Nullable,
-- auto-referenciada, aditiva — ninguna fila existente se ve afectada.
ALTER TABLE relics ADD COLUMN forked_from_id TEXT REFERENCES relics(id);
