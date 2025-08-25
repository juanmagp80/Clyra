-- Añadir campo category a la tabla tasks
-- Este script añade la funcionalidad de categorías a las tareas para poder clasificar el tiempo empleado

-- Añadir columna category a tasks si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'category') THEN
        ALTER TABLE tasks ADD COLUMN category VARCHAR(100) DEFAULT 'general';
    END IF;
END $$;

-- Crear índice para optimizar consultas por categoría
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_user_category ON tasks(user_id, category);

-- Actualizar tareas existentes con categorías por defecto basadas en el título/descripción
-- Esto es opcional, pero ayuda a tener datos iniciales

UPDATE tasks 
SET category = CASE 
    WHEN LOWER(title) LIKE '%diseño%' OR LOWER(title) LIKE '%design%' OR LOWER(description) LIKE '%diseño%' THEN 'design'
    WHEN LOWER(title) LIKE '%desarrollo%' OR LOWER(title) LIKE '%programar%' OR LOWER(title) LIKE '%código%' OR LOWER(title) LIKE '%frontend%' OR LOWER(title) LIKE '%backend%' THEN 'development'
    WHEN LOWER(title) LIKE '%reunión%' OR LOWER(title) LIKE '%meeting%' OR LOWER(title) LIKE '%llamada%' OR LOWER(title) LIKE '%cliente%' THEN 'meetings'
    WHEN LOWER(title) LIKE '%admin%' OR LOWER(title) LIKE '%factura%' OR LOWER(title) LIKE '%gestión%' OR LOWER(title) LIKE '%documentación%' THEN 'administration'
    WHEN LOWER(title) LIKE '%marketing%' OR LOWER(title) LIKE '%publicidad%' OR LOWER(title) LIKE '%social%' THEN 'marketing'
    WHEN LOWER(title) LIKE '%test%' OR LOWER(title) LIKE '%prueba%' OR LOWER(title) LIKE '%qa%' THEN 'testing'
    ELSE 'general'
END
WHERE category = 'general' OR category IS NULL;

-- Comentarios sobre las categorías disponibles:
-- 'development' - Desarrollo y programación
-- 'design' - Diseño gráfico, UI/UX, wireframes
-- 'meetings' - Reuniones con clientes, llamadas, presentaciones
-- 'administration' - Gestión, facturación, documentación
-- 'marketing' - Marketing, publicidad, redes sociales
-- 'testing' - Testing, QA, pruebas
-- 'general' - Tareas generales que no encajan en otras categorías
