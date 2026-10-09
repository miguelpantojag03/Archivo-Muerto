-- Vínculo a un archivo externo real (no copiado dentro de la app) por
-- reliquia, con una copia interna opcional. Nullable/aditivo — ninguna
-- fila existente se ve afectada.
ALTER TABLE relics ADD COLUMN linked_file_path        TEXT;
ALTER TABLE relics ADD COLUMN linked_file_mtime        TEXT;
ALTER TABLE relics ADD COLUMN linked_file_copied_path  TEXT;
