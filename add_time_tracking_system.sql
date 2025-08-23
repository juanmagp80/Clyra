-- Agregar columnas de tiempo a la tabla tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_running BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_start TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_stop TIMESTAMP NULL;

-- Agregar comentarios para documentar las columnas
COMMENT ON COLUMN tasks.is_running IS 'Indica si la tarea está actualmente en ejecución (cronómetro activo)';
COMMENT ON COLUMN tasks.total_time_seconds IS 'Tiempo total trabajado en la tarea en segundos';
COMMENT ON COLUMN tasks.started_at IS 'Timestamp de cuando se inició la tarea por primera vez';
COMMENT ON COLUMN tasks.last_start IS 'Timestamp de la última vez que se inició el cronómetro';
COMMENT ON COLUMN tasks.last_stop IS 'Timestamp de la última vez que se detuvo el cronómetro';

-- Crear tabla para registrar sesiones de tiempo detalladas
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    duration_seconds INTEGER DEFAULT 0,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- Habilitar RLS para time_entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Política RLS para time_entries
CREATE POLICY "Users can manage their own time entries" ON time_entries
    FOR ALL USING (auth.uid() = user_id);

-- Agregar comentarios a la tabla time_entries
COMMENT ON TABLE time_entries IS 'Registro detallado de sesiones de tiempo trabajado en tareas';
COMMENT ON COLUMN time_entries.task_id IS 'ID de la tarea asociada';
COMMENT ON COLUMN time_entries.project_id IS 'ID del proyecto asociado';
COMMENT ON COLUMN time_entries.user_id IS 'ID del usuario que trabajó';
COMMENT ON COLUMN time_entries.start_time IS 'Momento de inicio de la sesión';
COMMENT ON COLUMN time_entries.end_time IS 'Momento de fin de la sesión (NULL si está en curso)';
COMMENT ON COLUMN time_entries.duration_seconds IS 'Duración de la sesión en segundos';
COMMENT ON COLUMN time_entries.description IS 'Descripción opcional de lo trabajado en esta sesión';

-- Verificar las nuevas columnas y tabla
SELECT 
    'tasks' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('is_running', 'total_time_seconds', 'started_at', 'last_start', 'last_stop')

UNION ALL

SELECT 
    'time_entries' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'time_entries'
ORDER BY table_name, column_name;
