-- Agregar campos faltantes a la tabla de automatizaciones

-- Agregar campo description
ALTER TABLE automations ADD COLUMN IF NOT EXISTS description TEXT;

-- Agregar índice para mejorar el rendimiento de búsqueda
CREATE INDEX IF NOT EXISTS idx_automations_description ON automations(description);

-- Actualizar las automatizaciones existentes con descripciones por defecto
UPDATE automations SET description = 'Automatización sin descripción' WHERE description IS NULL;
